import express from "express";
import { getOrderBySessionId, getOrdersByUserEmail } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Order lookup by session ID - requires authentication
router.get("/session/:sessionId", authMiddleware, getOrderBySessionId);
// User's orders - requires authentication
router.get("/user/:email", authMiddleware, getOrdersByUserEmail);

export default router;
