import express from "express";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats
} from "../controllers/adminProductController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Admin product routes - all require authentication and admin privileges
router.get("/", authMiddleware, adminMiddleware, getAdminProducts);
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);
router.get("/stats", authMiddleware, adminMiddleware, getProductStats);

export default router;