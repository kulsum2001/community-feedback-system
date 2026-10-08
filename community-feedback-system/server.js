const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
//const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

require('dotenv').config({ path: __dirname + '/.env' });
  // ✅ Explicitly load .env file


const app = express();

// ✅ Create folders if missing
const uploadPath = path.join(__dirname, 'uploads');
const publicPath = path.join(__dirname, 'public');

[uploadPath, publicPath].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ '${dir}' folder created successfully!`);
    }
});

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Fix: Allow CORS from any origin for dev purposes
app.use(cors());

// ✅ Logger
app.use(morgan('dev'));

// ✅ Static File Hosting
app.use('/static/uploads', express.static(uploadPath));
app.use(express.static(publicPath));

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_feedback_system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
});

// ✅ Email Setup
// ✅ Debugging: Check if email credentials are loading
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Not Loaded ❌");

// ✅ Email Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent: ' + info.response);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};

// ✅ Routes
const userRoutes = require('./routes/user');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require("./routes/admin");
//const userRoutes = require("./routes/user");

app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use("/api/admin", adminRoutes);
//app.use("/api/users", userRoutes);

// ✅ Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// ✅ Export if needed
module.exports = { app, sendEmail };
