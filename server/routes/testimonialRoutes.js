import express from "express";
import { getTestimonials, getProductReviews } from "../controllers/getTestimonials.js";

const router = express.Router();

router.get("/", getTestimonials);
router.get("/product/:productId", getProductReviews);

export default router;