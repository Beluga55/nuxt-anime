import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  phone: { type: String },
  country: { type: String },
  password: { type: String },
  email: { type: String, required: true, unique: true },
  isAdmin: { type: Boolean, default: false },
  image: { type: String, default: "" },
  isGoogle: { type: Boolean, default: false },
  emailPreferences: {
    orderUpdates: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    supportUpdates: { type: Boolean, default: true },
    securityAlerts: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false },
    promotions: { type: Boolean, default: false },
  },
  emailVerified: { type: Boolean, default: false },
  lastEmailSent: { type: Date },
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;
