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
});

const User = mongoose.model("User", userSchema);

export default User;
