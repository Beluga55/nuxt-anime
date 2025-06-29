import cors from "cors";
import express from "express";
import connectDB from "./database.js";
import productRoutes from "./routes/productRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userPreferencesRoutes from "./routes/userPreferencesRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import adminSupportRoutes from "./routes/adminSupportRoutes.js";
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
app.use("/api/users", userPreferencesRoutes);
app.use("/admin/products", adminProductRoutes);
app.use("/admin/orders", adminOrderRoutes);
app.use("/admin/users", adminUserRoutes);
app.use("/admin/support", adminSupportRoutes);

const port = 8080;

connectDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
