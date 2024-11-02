import express from "express";
import { registerUser, loginUser, loginGoogle } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/login-google", loginGoogle);

export default router;