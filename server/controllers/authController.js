import User from "../models/User.js";
import { getSignedUrl } from "./getImagesFromCloud.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import twilio from "twilio";
import Otp from "../models/Otp.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";

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

    // Check if user has soft deleted account
    if (user.deletedAt) {
      return res.status(410).json({ message: "Account has been deleted" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user has 2FA enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      // Create temporary token for 2FA verification
      const tempToken = jwt.sign(
        { 
          email: user.email, 
          id: user._id, 
          type: 'temp_2fa',
          remember 
        },
        process.env.JWT_SECRET,
        { expiresIn: "10m" } // Short-lived temp token
      );

      return res.status(200).json({
        requires2FA: true,
        tempToken,
        message: "Please enter your 2FA code to complete login"
      });
    }

    // Normal login without 2FA
    const signedUrl = await getSignedUrl(user.image);

    // Create a JWT token
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: remember ? "30d" : "1h" }
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

// Security endpoints

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has soft deleted account
    if (user.deletedAt) {
      return res.status(410).json({ message: "Account has been deleted" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};

export const setupTwoFactor = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has soft deleted account
    if (user.deletedAt) {
      return res.status(410).json({ message: "Account has been deleted" });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `BunzStudio (${user.email})`,
      issuer: 'BunzStudio',
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Store secret temporarily (will be confirmed during verification)
    user.twoFactorTempSecret = secret.base32;
    await user.save();

    res.status(200).json({
      qrCodeUrl,
      manualEntryKey: secret.base32,
      secret: secret.base32
    });
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    res.status(500).json({ message: "Failed to setup two-factor authentication" });
  }
};

export const verifyTwoFactor = async (req, res) => {
  try {
    const { token: userToken, secret } = req.body;
    const authToken = req.headers.authorization?.split(' ')[1];
    
    if (!authToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has soft deleted account
    if (user.deletedAt) {
      return res.status(410).json({ message: "Account has been deleted" });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: userToken,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 8; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    // Enable 2FA
    user.twoFactorSecret = secret;
    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = backupCodes;
    user.twoFactorTempSecret = undefined;
    await user.save();

    res.status(200).json({
      message: "Two-factor authentication enabled successfully",
      backupCodes
    });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    res.status(500).json({ message: "Invalid verification code" });
  }
};

export const disableTwoFactor = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has soft deleted account
    if (user.deletedAt) {
      return res.status(410).json({ message: "Account has been deleted" });
    }

    // Disable 2FA
    user.twoFactorSecret = undefined;
    user.twoFactorEnabled = false;
    user.twoFactorBackupCodes = [];
    user.twoFactorTempSecret = undefined;
    await user.save();

    res.status(200).json({ message: "Two-factor authentication disabled successfully" });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    res.status(500).json({ message: "Failed to disable two-factor authentication" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already has soft deleted account
    if (user.deletedAt) {
      return res.status(410).json({ message: "Account has already been deleted" });
    }

    // Verify password (skip for Google users)
    if (!user.isGoogle) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid password" });
      }
    }

    // Soft delete - set deletedAt timestamp
    user.deletedAt = new Date();
    user.isActive = false;
    
    // Clear sensitive data but keep for legal/compliance purposes
    user.twoFactorSecret = undefined;
    user.twoFactorEnabled = false;
    user.twoFactorBackupCodes = [];
    user.twoFactorTempSecret = undefined;
    
    await user.save();

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -twoFactorSecret -twoFactorBackupCodes -twoFactorTempSecret');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has soft deleted account
    if (user.deletedAt) {
      return res.status(410).json({ message: "Account has been deleted" });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      phone: user.phone,
      country: user.country,
      twoFactorEnabled: user.twoFactorEnabled,
      emailPreferences: user.emailPreferences,
      isGoogle: user.isGoogle
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

export const verifyLogin2FA = async (req, res) => {
  try {
    const { tempToken, twoFactorCode, backupCode } = req.body;
    
    if (!tempToken) {
      return res.status(400).json({ message: "Temporary token is required" });
    }

    if (!twoFactorCode && !backupCode) {
      return res.status(400).json({ message: "2FA code or backup code is required" });
    }

    // Verify temporary token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired temporary token" });
    }

    // Check if it's a valid temp 2FA token
    if (decoded.type !== 'temp_2fa') {
      return res.status(401).json({ message: "Invalid token type" });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has soft deleted account
    if (user.deletedAt) {
      return res.status(410).json({ message: "Account has been deleted" });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA is not enabled for this account" });
    }

    let isValidCode = false;

    // Verify 2FA code or backup code
    if (twoFactorCode) {
      // Verify TOTP code
      isValidCode = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2,
      });
    } else if (backupCode) {
      // Verify backup code
      const backupCodeIndex = user.twoFactorBackupCodes.indexOf(backupCode.toUpperCase());
      if (backupCodeIndex !== -1) {
        // Remove used backup code
        user.twoFactorBackupCodes.splice(backupCodeIndex, 1);
        await user.save();
        isValidCode = true;
      }
    }

    if (!isValidCode) {
      return res.status(400).json({ message: "Invalid 2FA code or backup code" });
    }

    // Generate final login token
    const signedUrl = await getSignedUrl(user.image);
    
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: decoded.remember ? "30d" : "1h" }
    );

    const userData = {
      username: user.username,
      email: user.email,
      image: signedUrl,
      token,
      remember: decoded.remember,
      backupCodesRemaining: user.twoFactorBackupCodes.length
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error verifying 2FA login:", error);
    res.status(500).json({ message: "Failed to verify 2FA code" });
  }
};
