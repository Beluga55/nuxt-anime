import express from "express";
import { registerUser, loginUser, loginGoogle, requestOtp, verifyOtp, completeProfile, changePassword, setupTwoFactor, verifyTwoFactor, disableTwoFactor, deleteAccount, getUserProfile, verifyLogin2FA } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-login-2fa", verifyLogin2FA);
router.post("/login-google", loginGoogle);
router.get("/otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/complete-profile", completeProfile);

// Security routes
router.post("/change-password", changePassword);
router.post("/setup-2fa", setupTwoFactor);
router.post("/verify-2fa", verifyTwoFactor);
router.post("/disable-2fa", disableTwoFactor);
router.delete("/delete-account", deleteAccount);
router.get("/profile", getUserProfile);

export default router;