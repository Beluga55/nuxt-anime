import express from "express";
import {
  getAdminOrders,
  getOrderDetails,
  updateOrderStatus,
  deleteOrder,
  getOrderStats
} from "../controllers/adminOrderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Admin order routes - all require authentication and admin privileges
router.get("/", authMiddleware, adminMiddleware, getAdminOrders);
router.get("/stats", authMiddleware, adminMiddleware, getOrderStats);
router.get("/:id", authMiddleware, adminMiddleware, getOrderDetails);
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);
router.delete("/:id", authMiddleware, adminMiddleware, deleteOrder);

export default router;