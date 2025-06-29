import express from "express";
import {
  getAdminSupportTickets,
  getSupportTicketDetails,
  updateSupportTicketStatus,
  deleteSupportTicket,
  addSupportTicketResponse,
  getSupportTicketStats
} from "../controllers/adminSupportController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Admin support ticket routes - all require authentication and admin privileges
router.get("/", authMiddleware, adminMiddleware, getAdminSupportTickets);
router.get("/stats", authMiddleware, adminMiddleware, getSupportTicketStats);
router.get("/:id", authMiddleware, adminMiddleware, getSupportTicketDetails);
router.put("/:id/status", authMiddleware, adminMiddleware, updateSupportTicketStatus);
router.put("/:id/response", authMiddleware, adminMiddleware, addSupportTicketResponse);
router.delete("/:id", authMiddleware, adminMiddleware, deleteSupportTicket);

export default router;