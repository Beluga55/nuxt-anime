import Stripe from "stripe";
import * as dotenv from "dotenv";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import emailService from "../services/emailService.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export const createCheckoutSession = async (req, res) => {
  try {
    const { items, email } = req.body;
    
    // Generate a unique order ID with timestamp + random number
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const orderId = timestamp + randomNum;
    
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

    console.log(`✅ Webhook event verified: ${event.type}`);
    console.log('📦 Event data:', JSON.stringify({
      id: event.id,
      type: event.type,
      created: event.created
    }, null, 2));

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log(`💳 Processing checkout session: ${session.id}, payment_status: ${session.payment_status}`);

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
            let totalAmount = 0;
            
            // We need to find the product IDs from our database based on the product names
            for (const item of lineItems) {
              // Extract product name from the item description or name
              const productName = item.description;
              
              // Find the product in our database
              const product = await Product.findOne({ name: productName });
              
              if (product) {
                // Validate Stripe data before processing
                if (!item.amount_total || !item.quantity || item.quantity <= 0) {
                  console.error(`Invalid Stripe line item data:`, {
                    description: item.description,
                    amount_total: item.amount_total,
                    quantity: item.quantity
                  });
                  continue; // Skip this item
                }
                
                // Get price from Stripe (convert from cents to dollars)
                const priceAtPurchase = Number((item.amount_total / 100 / item.quantity).toFixed(2));
                const itemTotal = Number((item.amount_total / 100).toFixed(2));
                
                // Additional validation
                if (isNaN(priceAtPurchase) || priceAtPurchase <= 0) {
                  console.error(`Invalid price calculation for product ${productName}:`, {
                    amount_total: item.amount_total,
                    quantity: item.quantity,
                    calculated_price: priceAtPurchase
                  });
                  continue; // Skip this item
                }
                
                orderItems.push({
                  product: product._id,
                  qty: item.quantity,
                  price: priceAtPurchase
                });
                
                // Add to total amount
                totalAmount += itemTotal;
                
                // Update inventory (decrease stock)
                product.stock = Math.max(0, product.stock - item.quantity);
                await product.save();
                
                console.log(`Processed order item: ${productName}, qty: ${item.quantity}, price: $${priceAtPurchase}`);
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
            
            // Validate order data before creation
            if (orderItems.length === 0) {
              console.error('No valid order items found, cannot create order');
              return res.status(400).json({ error: 'No valid order items found' });
            }
            
            if (!totalAmount || totalAmount <= 0) {
              console.error('Invalid total amount:', totalAmount);
              return res.status(400).json({ error: 'Invalid order total amount' });
            }
            
            // Round total amount to 2 decimal places
            totalAmount = Number(totalAmount.toFixed(2));
            
            console.log(`Creating order with ${orderItems.length} items, total: $${totalAmount}`);
            
            // 4. Create and save the order
            const order = new Order({
              user: user._id,
              orderItems: orderItems,
              shippingAddress: shippingAddress,
              paymentMethod: paymentMethodType,
              totalAmount: totalAmount,
              datePlaced: new Date(),
              status: 'Paid', // Since payment is confirmed
              metadata: {
                session_id: session.id,
                order_id: session.metadata?.order_id || (() => {
                  const timestamp = Date.now().toString().slice(-6);
                  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
                  return timestamp + randomNum;
                })()
              }
            });
            
            try {
              await order.save();
              console.log(`✅ Order saved to database: ${order._id}`);
            } catch (saveError) {
              console.error('❌ Error saving order to database:', saveError);
              console.error('Order data that failed to save:', JSON.stringify({
                user: order.user,
                orderItems: order.orderItems.map(item => ({
                  product: item.product,
                  qty: item.qty,
                  price: item.price
                })),
                totalAmount: order.totalAmount,
                status: order.status
              }, null, 2));
              return res.status(500).json({ error: 'Failed to save order', details: saveError.message });
            }
            
            // Send order confirmation email
            try {
              // Prepare order data for email
              const orderDataForEmail = {
                orderId: order.metadata.order_id,
                customerName: user?.username || customerEmail.split('@')[0],
                date: order.datePlaced,
                totalAmount: orderItems.reduce((sum, item) => {
                  const product = orderItems.find(oi => oi.product.toString() === item.product.toString());
                  return sum + (product ? lineItems.find(li => li.description === product.name)?.amount_total / 100 || 0 : 0);
                }, 0),
                items: await Promise.all(orderItems.map(async (item) => {
                  const product = await Product.findById(item.product);
                  const lineItem = lineItems.find(li => li.description === product?.name);
                  return {
                    name: product?.name || 'Unknown Product',
                    quantity: item.qty,
                    price: lineItem ? lineItem.amount_total / 100 / item.qty : 0
                  };
                })),
                shippingAddress
              };
              
              // Get user's email preferences (fallback to default if not found)
              const userPreferences = user?.emailPreferences || { orderUpdates: true };
              
              // Send the email
              const emailResult = await emailService.sendOrderConfirmation(
                customerEmail, 
                orderDataForEmail, 
                userPreferences
              );
              
              if (emailResult.success) {
                console.log(`Order confirmation email sent to ${customerEmail}`);
              } else if (emailResult.skipped) {
                console.log(`Order confirmation email skipped for ${customerEmail} (disabled in preferences)`);
              } else {
                console.error(`Failed to send order confirmation email to ${customerEmail}:`, emailResult.error);
              }
            } catch (emailError) {
              console.error('Error sending order confirmation email:', emailError);
              // Don't fail the order creation if email fails
            }
            
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
