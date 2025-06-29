import express from "express";
import {
  getAdminUsers,
  getUserDetails,
  updateUser,
  toggleUserStatus,
  deleteUser,
  getUserStats
} from "../controllers/adminUserController.js";

const router = express.Router();

// Admin user routes
router.get("/", getAdminUsers);
router.get("/stats", getUserStats);
router.get("/:id", getUserDetails);
router.put("/:id", updateUser);
router.put("/:id/status", toggleUserStatus);
router.delete("/:id", deleteUser);

export default router;