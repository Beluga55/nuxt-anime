import Stripe from "stripe";
import * as dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export const createCheckoutSession = async (req, res) => {
  try {
    const { items } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: [
        "card", // This includes both credit cards and digital wallets (Google Pay, Apple Pay)
        "fpx",  // Malaysian online banking
        "grabpay"
      ],
      line_items: items.map((item) => ({
        price_data: {
          currency: "myr",
          product_data: {
            images: [item.image], // Image first
            name: item.name, // Then name
            description: item.description // Then description
          },
          unit_amount: item.amount,
        },
        quantity: item.quantity, // Quantity last
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
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/products`,
      customer_creation: "always",
      phone_number_collection: {
        enabled: true,
      },
    });

    res.json({ session: session });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
};
