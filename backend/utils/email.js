const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, type = 'signup') => {
  try {
    const transporter = createTransporter();
    
    const subjects = {
      signup: 'Verify Your Email - ShopWise',
      reset: 'Password Reset - ShopWise'
    };
    
    const messages = {
      signup: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B2F2F;">Welcome to ShopWise!</h2>
          <p>Thank you for signing up. Please verify your email address using the OTP below:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #3B2F2F; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>ShopWise Team</p>
        </div>
      `,
      reset: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B2F2F;">Password Reset - ShopWise</h2>
          <p>You requested a password reset. Use the OTP below to reset your password:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #3B2F2F; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email and ensure your account is secure.</p>
          <p>Best regards,<br>ShopWise Team</p>
        </div>
      `
    };
    
    const mailOptions = {
      from: `"ShopWise" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subjects[type],
      html: messages[type]
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"ShopWise" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to ShopWise!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B2F2F;">Welcome to ShopWise, ${name}!</h2>
          <p>Your account has been successfully created and verified.</p>
          <p>You can now enjoy shopping with us and access all our features:</p>
          <ul>
            <li>Browse our wide range of products</li>
            <li>Add items to your cart</li>
            <li>Secure checkout process</li>
            <li>Order tracking</li>
          </ul>
          <p>Happy Shopping!</p>
          <p>Best regards,<br>ShopWise Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email failure
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail
};