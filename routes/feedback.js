const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { createFeedback, getAllFeedback, getFeedbackByUser, getFeedbackStats } = require('../controllers/feedbackController');
const { markFeedbackResolved } = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Ensure 'uploads' directory exists
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log("✅ 'uploads/' folder created successfully!");
}

// ✅ Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '')}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('❌ Only image files are allowed!'), false);
    }
};

const upload = multer({ storage, fileFilter });

// ✅ Configure NodeMailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email password (use an app password)
    }
});
        // ✅ Verify Transporter Connection
    transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Nodemailer Error:", error);
    } else {
        console.log("✅ Nodemailer Ready to Send Emails!");
    }
});

// ✅ Route to Handle Feedback Submission (POST)
router.post('/', authMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        console.log("📥 Incoming request body:", req.body);
        console.log("📷 Uploaded Files:", req.files);

        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized! Login required." });
        }

        // ❌ Prevent admins from submitting feedback
        if (req.user.role === 'admin') {
            return res.status(403).json({ success: false, message: "Admins cannot submit feedback!" });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: "Request body is missing!" });
        }

        const { userId, title, category, description, location } = req.body;
        if (!userId || !title || !category || !description) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const imageUrls = req.files ? req.files.map(file => `/static/uploads/${file.filename}`) : [];

        let parsedLocation = { type: 'Point', coordinates: [0, 0] };
        if (location) {
            try {
                parsedLocation = JSON.parse(location);
            } catch (error) {
                console.log("🚨 Invalid location format:", error.message);
                return res.status(400).json({ success: false, message: "Invalid location format" });
            }
        }

        req.body.images = imageUrls;
        req.body.location = parsedLocation;

        // ✅ Get feedback data without sending a response
        const feedback = await createFeedback(req, res);
        if (!res.headersSent) {
            res.status(201).json({ success: true, message: "Feedback submitted successfully", feedback });
        }

        // ✅ Send email after response is sent
        if (feedback) {
            console.log("📧 Sending email notification...");

            const imageTags = req.files.map(file => 
                `<p><img src="cid:${file.filename}" alt="Feedback Image" style="max-width:300px; display:block; margin-top:10px; border: 1px solid #ddd;"></p>`
            ).join("");

            const attachments = req.files.map(file => ({
                filename: file.filename,
                path: file.path, // Correct file path
                cid: file.filename // Content-ID must match src in email HTML
            }));

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: "admin@example.com", // here add the admin email
                subject: "New Community Feedback Submitted",
                html: `<p><strong>A new feedback has been submitted:</strong></p>
                       <p><strong>Title:</strong> ${title}</p>
                       <p><strong>Category:</strong> ${category}</p>
                       <p><strong>Description:</strong> ${description}</p>
                       <p><strong>User ID:</strong> ${userId}</p>
                       <p>Check the admin panel for more details.</p>
                       <p><strong>Images:</strong></p>
                       ${imageTags}`,  // ✅ Embed images properly here
                attachments: attachments // ✅ Attach images correctly
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("❌ Error sending email:", error);
                } else {
                    console.log("✅ Email sent successfully:", info.response);
                }
            });
        }

    } catch (error) {
        console.error("🔥 Error submitting feedback:", error.message);
        
        // ✅ Only send response if headers haven't been sent
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Server error", error: error.message });
        }
    }
});
router.get('/all-feedbacks', async (req, res) => {
    try {
      const feedbacks = await Feedback.find().populate('userId', 'email name');
      res.json(feedbacks);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  

// ✅ Get All Feedback (GET)
router.get('/', async (req, res) => {
    try {
        await getAllFeedback(req, res);
    } catch (error) {
        console.error("🔥 Error fetching feedback:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// ✅ Get Feedback for a Specific User (GET)
router.get('/user/:userId', async (req, res) => {
    try {
        await getFeedbackByUser(req, res);
    } catch (error) {
        console.error("🔥 Error fetching user feedback:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});
router.get('/stats', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admins only!' });
    }
    await getFeedbackStats(req, res);
});

// ✅ Serve Uploaded Images
router.use('/uploads', express.static(uploadPath));
// ✅ Route for Admin to Respond to Feedback via Email
// ✅ Route for Admin to Respond to Feedback via Email and Mark as Resolved
router.post('/:id/respond', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admins only!' });
        }

        const { message } = req.body;
        const feedbackId = req.params.id;

        const Feedback = require('../models/Feedback');
        const feedback = await Feedback.findById(feedbackId).populate('userId', 'email name');

        if (!feedback || !feedback.userId?.email) {
            return res.status(404).json({ success: false, message: 'Feedback or user not found' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: feedback.userId.email,
            subject: `Response to your feedback: "${feedback.title}"`,
            text: `Dear ${feedback.userId.name || 'User'},\n\n${message}\n\nBest regards,\nCommunity Admin`
        };

        // ✅ Send email
        await transporter.sendMail(mailOptions);
        console.log("📨 Admin response email sent to:", feedback.userId.email);

        // ✅ Update feedback status to 'resolved'
        feedback.status = 'resolved';
        await feedback.save();

        res.json({ success: true, message: 'Response sent and feedback marked as resolved.' });

    } catch (error) {
        console.error("❌ Failed to send admin response:", error.message);
        res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
    }
});

// ✅ Mark Feedback as Resolved
router.patch('/:id/resolve', markFeedbackResolved);


module.exports = router;
