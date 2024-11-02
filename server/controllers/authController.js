import User from "../models/User.js";
import { getSignedUrl } from "./getImagesFromCloud.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

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
      email,
      password: hashedPassword,
      isAdmin: false,
      image: "default_pfp.png",
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error signing up user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

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
    };

    // Send the user data along with the signed URL
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error logging in user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginGoogle = async (req, res) => {
  try {
    const { given_name } = req.body;

    let user = await User.findOne({ username: given_name });

    if (!user) {
      // Create a new user
      user = new User({
        username: given_name,
        email: "",
        isAdmin: false,
        image: "",
        isGoogle: true,
      });

      await user.save();
    }

    // Create a JWT token using the user variable (either existing or newly created)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send back the token
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
