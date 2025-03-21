import Stripe from "stripe";
import * as dotenv from "dotenv";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export const createCheckoutSession = async (req, res) => {
  try {
    const { items, email } = req.body;
    
    // Generate a unique order ID
    const orderId = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
    
    // Encode items data to pass in URL (limited to essential info)
    const itemsData = encodeURIComponent(JSON.stringify(
      items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        amount: item.amount
      }))
    ));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "fpx", "grabpay"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "myr",
          product_data: {
            images: [item.image],
            name: item.name,
            description: item.description,
          },
          unit_amount: item.amount,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      locale: "auto",
      shipping_address_collection: {
        allowed_countries: [
          "MY",
          "SG",
          "US",
          "GB",
          "AU",
          "JP",
          "KR",
          "CN",
          "TH",
        ],
      },
      billing_address_collection: "required",
      submit_type: "pay",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/products?cancel`,
      customer_creation: "always",
      phone_number_collection: {
        enabled: true,
      },
      customer_email: email, // Pre-fill customer email and send receipt
      metadata: {
        order_id: orderId
      }
    });

    res.json({ session: session });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verify webhook signature using the Stripe webhook secret
    // This ensures the webhook is actually coming from Stripe
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.warn(
        "Webhook secret not configured. Skipping signature verification."
      );
      event = req.body;
    } else {
      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody || req.body,
          sig,
          endpointSecret
        );
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res
          .status(400)
          .json({
            success: false,
            error: `Webhook signature verification failed: ${err.message}`,
          });
      }
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;

        if (session.payment_status === "paid") {
          // Get the order details from the session
          const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
            session.id,
            { expand: ["line_items"] }
          );

          // Access the line items array
          const lineItems = sessionWithLineItems.line_items.data;

          // Save the order to your database
          try {
            // 1. Find or create user based on email
            const customerEmail = sessionWithLineItems.customer_details.email;
            let user = await User.findOne({ email: customerEmail });
            
            // 2. Map line items to order items with product references
            const orderItems = [];
            
            // We need to find the product IDs from our database based on the product names
            for (const item of lineItems) {
              // Extract product name from the item description or name
              const productName = item.description;
              
              // Find the product in our database
              const product = await Product.findOne({ name: productName });
              
              if (product) {
                orderItems.push({
                  product: product._id,
                  qty: item.quantity
                });
                
                // Update inventory (decrease stock)
                product.stock = Math.max(0, product.stock - item.quantity);
                await product.save();
              } else {
                console.warn(`Product not found: ${productName}`);
              }
            }
            
            // 3. Create shipping address object
            const shippingDetails = sessionWithLineItems.shipping_details || 
                                   sessionWithLineItems.customer_details;
            
            const shippingAddress = {
              address: shippingDetails.address?.line1 || '',
              city: shippingDetails.address?.city || '',
              postalCode: shippingDetails.address?.postal_code || '',
              country: shippingDetails.address?.country || ''
            };
            
            // Get payment method information
            let paymentMethodType = 'Stripe'; // Default fallback
            
            // Try to get the payment method from payment_method_types
            if (sessionWithLineItems.payment_method_types && sessionWithLineItems.payment_method_types.length > 0) {
              // Use the first payment method type (usually there's only one in a completed payment)
              paymentMethodType = sessionWithLineItems.payment_method_types[0];
              // Capitalize first letter for better display
              paymentMethodType = paymentMethodType.charAt(0).toUpperCase() + paymentMethodType.slice(1);
            }
            
            // 4. Create and save the order
            const order = new Order({
              user: user._id,
              orderItems: orderItems,
              shippingAddress: shippingAddress,
              paymentMethod: paymentMethodType,
              datePlaced: new Date(),
              status: 'Paid', // Since payment is confirmed
              metadata: {
                session_id: session.id,
                order_id: session.metadata?.order_id || Math.floor(Math.random() * 1000000).toString().padStart(6, "0")
              }
            });
            
            await order.save();
            console.log(`Order saved to database: ${order._id}`);
            
            // Here you could also send confirmation email to customer
            
          } catch (error) {
            console.error(`Error saving order to database: ${error.message}`);
          }
        } else {
          console.log(`Payment not yet complete for session ${session.id}`);
        }
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Webhook error: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};
