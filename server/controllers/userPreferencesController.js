import User from '../models/User.js';
import emailService from '../services/emailService.js';

export const getUserPreferences = async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ email }).select('emailPreferences emailVerified');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      emailPreferences: user.emailPreferences,
      emailVerified: user.emailVerified
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserPreferences = async (req, res) => {
  try {
    const { email } = req.params;
    const { emailPreferences } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.emailPreferences = { ...user.emailPreferences, ...emailPreferences };
    await user.save();

    res.status(200).json({
      message: 'Preferences updated successfully',
      emailPreferences: user.emailPreferences
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const sendTestEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { emailType } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let emailResult;
    
    switch (emailType) {
      case 'order':
        const mockOrderData = {
          orderId: 'TEST-ORDER-001',
          customerName: user.username,
          date: new Date(),
          totalAmount: 99.99,
          items: [
            { name: 'Test Product', quantity: 1, price: 99.99 }
          ],
          shippingAddress: {
            address: '123 Test Street',
            city: 'Test City',
            postalCode: '12345',
            country: 'Malaysia'
          }
        };
        emailResult = await emailService.sendOrderConfirmation(email, mockOrderData, user.emailPreferences);
        break;
        
      case 'support':
        const mockSupportData = {
          username: user.username,
          subject: 'Test Support Request',
          message: 'This is a test support request'
        };
        emailResult = await emailService.sendSupportConfirmation(email, mockSupportData, user.emailPreferences);
        break;
        
      case 'marketing':
        const mockMarketingData = {
          subject: 'Test Marketing Email - New Products Available!',
          textContent: 'Check out our new products and special offers.',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #fd7968;">New Products Available!</h2>
              <p>This is a test marketing email to demonstrate our email system.</p>
              <p>Check out our latest anime merchandise and special offers!</p>
            </div>
          `
        };
        emailResult = await emailService.sendMarketingEmail(email, mockMarketingData, user.emailPreferences);
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid email type' });
    }

    if (emailResult.success) {
      res.status(200).json({ 
        message: `Test ${emailType} email sent successfully`,
        skipped: emailResult.skipped || false
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send test email',
        error: emailResult.error
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const unsubscribeFromMarketing = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.emailPreferences.marketing = false;
    user.emailPreferences.newsletter = false;
    user.emailPreferences.promotions = false;
    await user.save();

    res.status(200).json({ 
      message: 'Successfully unsubscribed from marketing emails',
      redirectUrl: `${process.env.CLIENT_URL}/profile?section=settings&unsubscribed=true`
    });
  } catch (error) {
    console.error('Error unsubscribing user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const testEmailConnection = async (req, res) => {
  try {
    const result = await emailService.testConnection();
    
    if (result.success) {
      res.status(200).json({ 
        message: 'Email service connection successful',
        configured: true
      });
    } else {
      res.status(500).json({ 
        message: 'Email service connection failed',
        configured: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error testing email connection:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};