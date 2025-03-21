/**
 * Middleware to handle Stripe webhook requests
 * This middleware ensures that the raw body is preserved for signature verification
 * while also providing the parsed JSON body for easier handling
 */
export const stripeWebhookMiddleware = (req, res, next) => {
  if (req.originalUrl === "/api/webhook" && req.method === "POST") {
    // For Stripe webhooks, we need both the raw body (for signature verification)
    // and the parsed JSON body (for easier handling)

    // The raw body is already available as req.body from express.raw middleware
    if (req.body) {
      // Store the raw body for signature verification
      req.rawBody = req.body;

      // Parse the raw body to JSON if it's not already parsed
      if (Buffer.isBuffer(req.body)) {
        try {
          req.body = JSON.parse(req.body.toString("utf8"));
        } catch (error) {
          console.error("Error parsing webhook payload:", error);
          return res.status(400).json({ error: "Invalid JSON payload" });
        }
      }
    }
  }

  next();
};
