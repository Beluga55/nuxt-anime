import cors from "cors";
import express from "express";
import connectDB from "./database.js";
import productRoutes from "./routes/productRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { stripeWebhookMiddleware } from "./middleware/stripeWebhookMiddleware.js";

const app = express();
app.use(cors());
app.use("/api/webhook", express.raw({ type: "application/json" }));
app.use(stripeWebhookMiddleware);
app.use(express.json());

app.use("/products", productRoutes);
app.use("/testimonials", testimonialRoutes);
app.use("/support", supportRoutes);
app.use("/auth", authRoutes);
app.use("/api", stripeRoutes);
app.use("/api/orders", orderRoutes);

const port = 8080;

connectDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
