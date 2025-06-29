import express from "express";
import {
  getAdminSupportTickets,
  getSupportTicketDetails,
  updateSupportTicketStatus,
  deleteSupportTicket,
  addSupportTicketResponse,
  getSupportTicketStats
} from "../controllers/adminSupportController.js";

const router = express.Router();

// Admin support ticket routes
router.get("/", getAdminSupportTickets);
router.get("/stats", getSupportTicketStats);
router.get("/:id", getSupportTicketDetails);
router.put("/:id/status", updateSupportTicketStatus);
router.put("/:id/response", addSupportTicketResponse);
router.delete("/:id", deleteSupportTicket);

export default router;