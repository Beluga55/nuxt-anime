import express from "express";
import { getTestimonials } from "../controllers/getTestimonials.js";

const router = express.Router();

router.get("/", getTestimonials);

export default router;