import express from "express";
import { getOrderBySessionId, getOrdersByUserEmail } from "../controllers/orderController.js";

const router = express.Router();

router.get("/session/:sessionId", getOrderBySessionId);
router.get("/user/:email", getOrdersByUserEmail);

export default router;
