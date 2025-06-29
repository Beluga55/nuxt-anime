import express from "express";
import {
  getAdminOrders,
  getOrderDetails,
  updateOrderStatus,
  deleteOrder,
  getOrderStats
} from "../controllers/adminOrderController.js";

const router = express.Router();

// Admin order routes
router.get("/", getAdminOrders);
router.get("/stats", getOrderStats);
router.get("/:id", getOrderDetails);
router.put("/:id/status", updateOrderStatus);
router.delete("/:id", deleteOrder);

export default router;