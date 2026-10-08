const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,  // Your Gmail
    pass: process.env.MAIL_PASSWORD,  // App Password (not normal password)
  },
});

const sendEmail = async () => {
  try {
    let info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: "sakinakulsum82@gmail.com",
      subject: "Test Email",
      text: "This is a test email from Community Feedback System.",
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

sendEmail();
