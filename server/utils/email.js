const nodemailer = require('nodemailer');

// Check if email configuration is available
const isEmailConfigured = () => {
  return process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;
};

let transporter = null;

if (isEmailConfigured()) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

const sendEmail = async ({ to, subject, html }) => {
  try {
    // If email is not configured, just log the email content
    if (!isEmailConfigured() || !transporter) {
      console.log('Email not configured. Would send email to:', to);
      console.log('Subject:', subject);
      console.log('Content:', html);
      return { messageId: 'mock-email-id' };
    }

    const mailOptions = {
      from: `"Esocial" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't throw error in development, just log it
    if (process.env.NODE_ENV === 'development') {
      console.log('Email sending failed, but continuing in development mode');
      return { messageId: 'mock-email-id' };
    }
    throw error;
  }
};

module.exports = { sendEmail };
