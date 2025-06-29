import express from "express";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats
} from "../controllers/adminProductController.js";

const router = express.Router();

// Admin product routes
router.get("/", getAdminProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/stats", getProductStats);

export default router;