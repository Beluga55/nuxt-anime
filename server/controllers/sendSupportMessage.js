import Support from "../models/Support.js";
import User from "../models/User.js";
import emailService from "../services/emailService.js";

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
    
    // Send confirmation email to user
    try {
      // Get user's email preferences if they exist
      const user = await User.findOne({ email });
      const userPreferences = user?.emailPreferences || { supportUpdates: true };
      
      // Prepare support data for email
      const supportDataForEmail = {
        username: name,
        name: name,
        subject,
        message
      };
      
      // Send the confirmation email
      const emailResult = await emailService.sendSupportConfirmation(
        email, 
        supportDataForEmail, 
        userPreferences
      );
      
      if (emailResult.success) {
        console.log(`Support confirmation email sent to ${email}`);
      } else if (emailResult.skipped) {
        console.log(`Support confirmation email skipped for ${email} (disabled in preferences)`);
      } else {
        console.error(`Failed to send support confirmation email to ${email}:`, emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending support confirmation email:', emailError);
      // Don't fail the support request if email fails
    }
    
    res.status(201).json({ 
      message: "Support message sent successfully",
      emailSent: true 
    });
  } catch (error) {
    console.error('Error saving support message:', error);
    res.status(409).json({ message: error.message });
  }
};
