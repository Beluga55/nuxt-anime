import express from "express";
import {
  getAdminUsers,
  getUserDetails,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getUserStats
} from "../controllers/adminUserController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Admin user routes - all require authentication and admin privileges
router.get("/", authMiddleware, adminMiddleware, getAdminUsers);
router.get("/stats", authMiddleware, adminMiddleware, getUserStats);
router.get("/:id", authMiddleware, adminMiddleware, getUserDetails);
router.put("/:id", authMiddleware, adminMiddleware, updateUser);
router.put("/:id/status", authMiddleware, adminMiddleware, toggleUserStatus);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;