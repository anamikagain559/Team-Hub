const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

const testMail = async () => {
  console.log('Attempting to send test email with config:', {
    host: config.host,
    port: config.port,
    user: config.auth.user,
  });

  const transporter = nodemailer.createTransport(config);

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'test@example.com',
      subject: 'TeamHub Email Test',
      text: 'If you are reading this, your Mailtrap configuration is working correctly!',
      html: '<b>If you are reading this, your Mailtrap configuration is working correctly!</b>',
    });

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

testMail();
