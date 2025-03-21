import User from "../models/User.js";
import { getSignedUrl } from "./getImagesFromCloud.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import twilio from "twilio";
import Otp from "../models/Otp.js";

dotenv.config();

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const registerUser = async (req, res) => {
  try {
    const { username, phone, email, password, confirmPassword, country } =
      req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = new User({
      username,
      phone,
      country,
      email,
      password: hashedPassword,
      isAdmin: false,
      image: "default_pfp.png",
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          message:
            "User with this email already exists, Please login with your password",
        });
    }
    console.error("Error signing up user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const signedUrl = await getSignedUrl(user.image);

    // Create a JWT token
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const userData = {
      username: user.username,
      email: user.email,
      image: signedUrl,
      token,
      remember,
    };

    // Send the user data along with the signed URL
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error logging in user: ", error);
    res
      .status(500)
      .json({ message: "Try login with your password, or google sign in" });
  }
};

export const loginGoogle = async (req, res) => {
  try {
    const { given_name, email } = req.body;

    // Validate required fields
    if (!given_name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // First check if user exists with this email
    let user = await User.findOne({ email });

    if (user && !user.isGoogle) {
      return res.status(400).json({
        message: "This email is already registered. Please login with your password"
      });
    }

    if (!user) {
      // Create a new user
      user = new User({
        username: given_name,
        phone: "",
        email: email,
        isAdmin: false,
        image: "",
        isGoogle: true,
      });

      await user.save();
    }

    // Create a JWT token using the user variable
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Calculate token expiration (30 days from now)
    const tokenExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Check if user needs to provide phone number
    const needsPhone = !user.phone;

    // Send back the token and additional required information
    res.status(200).json({ 
      token,
      tokenExpiration,
      needsPhone,
      user: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        image: user.image
      }
    });
  } catch (error) {
    console.error("Error logging in user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requestOtp = async (req, res) => {
  try {
    const phone = process.env.TWILIO_PHONE_NUMBER;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Use Twilio Verify instead of direct message
    const verification = await client.verify.v2
      .services("VAb9814c0ccbe92dbccc8459fcdca9145e")
      .verifications.create({
        to: phone,
        channel: "sms",
      });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      verificationSid: verification.sid,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const phone = process.env.TWILIO_PHONE_NUMBER;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    // Verify the code using Twilio Verify
    const verificationCheck = await client.verify.v2
      .services("VAb9814c0ccbe92dbccc8459fcdca9145e")
      .verificationChecks.create({
        to: phone,
        code: otp,
      });

    if (verificationCheck.status === "approved") {
      res.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid OTP or OTP expired",
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const { phone, email, country } = req.body;

    if (!phone || !email || !country) {
      return res.status(400).json({
        success: false,
        message: "Phone number, email, and country are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.phone = phone;
    user.country = country;
    await user.save();

    // Return 204 No Content for successful update
    res.status(204).end();
  } catch (error) {
    console.error("Error completing profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete profile",
      error: error.message,
    });
  }
};
