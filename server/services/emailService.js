import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to, subject, textContent, htmlContent, options = {}) {
    try {
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Bunz Studio',
          address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER,
        },
        to,
        subject,
        text: textContent,
        html: htmlContent,
        ...options,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendOrderConfirmation(to, orderData, userPreferences = {}) {
    if (!userPreferences.orderUpdates) {
      console.log('User has disabled order update emails');
      return { success: true, skipped: true };
    }

    const subject = `Order Confirmation - ${orderData.orderId}`;
    const textContent = this.generateOrderConfirmationText(orderData);
    const htmlContent = this.generateOrderConfirmationHTML(orderData);

    return await this.sendEmail(to, subject, textContent, htmlContent);
  }

  async sendSupportConfirmation(to, supportData, userPreferences = {}) {
    if (!userPreferences.supportUpdates) {
      console.log('User has disabled support update emails');
      return { success: true, skipped: true };
    }

    const subject = 'Support Request Received - We\'ll Get Back to You Soon!';
    const textContent = this.generateSupportConfirmationText(supportData);
    const htmlContent = this.generateSupportConfirmationHTML(supportData);

    return await this.sendEmail(to, subject, textContent, htmlContent);
  }

  async sendMarketingEmail(to, marketingData, userPreferences = {}) {
    if (!userPreferences.marketing) {
      console.log('User has disabled marketing emails');
      return { success: true, skipped: true };
    }

    const subject = marketingData.subject;
    const textContent = marketingData.textContent;
    const htmlContent = marketingData.htmlContent;

    // Add unsubscribe link
    const unsubscribeUrl = `${process.env.CLIENT_URL}/unsubscribe?email=${encodeURIComponent(to)}`;
    const htmlWithUnsubscribe = htmlContent + `
      <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; text-align: center; color: #6c757d; font-size: 12px;">
        <p>You're receiving this email because you subscribed to our marketing updates.</p>
        <p><a href="${unsubscribeUrl}" style="color: #6c757d;">Unsubscribe</a> | <a href="${process.env.CLIENT_URL}/profile?section=settings" style="color: #6c757d;">Update Preferences</a></p>
      </div>
    `;

    return await this.sendEmail(to, subject, textContent, htmlWithUnsubscribe);
  }

  generateOrderConfirmationText(orderData) {
    return `
Order Confirmation - ${orderData.orderId}

Hi ${orderData.customerName || 'Valued Customer'},

Thank you for your order! We've received your payment and are preparing your items for shipment.

Order Details:
- Order ID: ${orderData.orderId}
- Date: ${new Date(orderData.date).toLocaleDateString()}
- Total: RM ${orderData.totalAmount.toFixed(2)}

Items Ordered:
${orderData.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - RM ${item.price.toFixed(2)}`).join('\n')}

${orderData.shippingAddress ? `
Shipping Address:
${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode}
${orderData.shippingAddress.country}
` : ''}

We'll send you another email when your order ships.

Best regards,
The Bunz Studio Team
    `.trim();
  }

  generateOrderConfirmationHTML(orderData) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #fd7968; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Order Confirmation</h1>
  </div>
  
  <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${orderData.customerName || 'Valued Customer'},</h2>
    
    <p>Thank you for your order! We've received your payment and are preparing your items for shipment.</p>
    
    <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #fd7968;">
      <h3 style="margin-top: 0; color: #fd7968;">Order Details</h3>
      <p><strong>Order ID:</strong> ${orderData.orderId}</p>
      <p><strong>Date:</strong> ${new Date(orderData.date).toLocaleDateString()}</p>
      <p><strong>Total:</strong> RM ${orderData.totalAmount.toFixed(2)}</p>
    </div>
    
    <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #333;">Items Ordered</h3>
      ${orderData.items.map(item => `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
          <strong>${item.name}</strong><br>
          <span style="color: #666;">Quantity: ${item.quantity} | Price: RM ${item.price.toFixed(2)}</span>
        </div>
      `).join('')}
    </div>
    
    ${orderData.shippingAddress ? `
    <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #333;">Shipping Address</h3>
      <p>
        ${orderData.shippingAddress.address}<br>
        ${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode}<br>
        ${orderData.shippingAddress.country}
      </p>
    </div>
    ` : ''}
    
    <p style="margin-top: 30px;">We'll send you another email when your order ships.</p>
    
    <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #fd7968; border-radius: 8px;">
      <p style="color: white; margin: 0;">
        <strong>Best regards,<br>The Bunz Studio Team</strong>
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  generateSupportConfirmationText(supportData) {
    return `
Support Request Received

Hi ${supportData.username || supportData.name},

We've received your support request and will get back to you as soon as possible.

Your Request Details:
- Subject: ${supportData.subject}
- Date: ${new Date().toLocaleDateString()}
- Status: Open

Our support team typically responds within 24 hours during business days.

If you need immediate assistance, please check our FAQ section at ${process.env.CLIENT_URL}/faqs

Best regards,
Bunz Studio Support Team
    `.trim();
  }

  generateSupportConfirmationHTML(supportData) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Request Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #17a2b8; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Support Request Received</h1>
  </div>
  
  <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${supportData.username || supportData.name},</h2>
    
    <p>We've received your support request and will get back to you as soon as possible.</p>
    
    <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #17a2b8;">
      <h3 style="margin-top: 0; color: #17a2b8;">Your Request Details</h3>
      <p><strong>Subject:</strong> ${supportData.subject}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Status:</strong> <span style="color: #28a745;">Open</span></p>
    </div>
    
    <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ffc107;">
      <p style="margin: 0;"><strong>Response Time:</strong> Our support team typically responds within 24 hours during business days.</p>
    </div>
    
    <p>If you need immediate assistance, please check our <a href="${process.env.CLIENT_URL}/faqs" style="color: #17a2b8;">FAQ section</a>.</p>
    
    <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #17a2b8; border-radius: 8px;">
      <p style="color: white; margin: 0;">
        <strong>Best regards,<br>Bunz Studio Support Team</strong>
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return { success: true };
    } catch (error) {
      console.error('Email service connection failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();