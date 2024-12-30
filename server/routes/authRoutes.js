import express from "express";
import { registerUser, loginUser, loginGoogle, requestOtp, verifyOtp } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/login-google", loginGoogle);
router.get("/otp", requestOtp);
router.post("/verify-otp", verifyOtp);

export default router;