import Support from "../models/Support.js";

export const sendSupportMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    const supportMessage = new Support({
      username: name,
      email,
      subject,
      message,
    });
    await supportMessage.save();
  } catch (error) {
    res.status(409).json({ message: error.message });
  }

  res.status(201).json({ message: "Support message sent successfully" });
};
