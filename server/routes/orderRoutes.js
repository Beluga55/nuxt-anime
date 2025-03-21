import express from "express";
import { getOrderBySessionId } from "../controllers/orderController.js";

const router = express.Router();

router.get("/session/:sessionId", getOrderBySessionId);

export default router;
