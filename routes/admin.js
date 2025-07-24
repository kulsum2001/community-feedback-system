const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Feedback = require("../models/Feedback");
const User = require("../models/User"); // Import User model
const isAdminMiddleware = require("../middleware/isAdminMiddleware"); // ✅ Correct import

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const admin = await User.findOne({ email, role: "admin" }); // Make sure the admin exists
        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
    } catch (error) {
        console.error("❌ Admin login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});
// ✅ Get Feedback Overview
router.get("/overview", isAdminMiddleware, async (req, res) => {
    try {
        const totalFeedback = await Feedback.countDocuments();
        const pendingFeedback = await Feedback.countDocuments({ status: "pending" });
        const resolvedFeedback = await Feedback.countDocuments({ status: "resolved" });

        res.json({ totalFeedback, pendingFeedback, resolvedFeedback });
    } catch (error) {
        res.status(500).json({ message: "Error fetching feedback data" });
    }
});

// ✅ Get User Statistics
router.get("/users", isAdminMiddleware, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeContributors = await Feedback.distinct("user").length; // Count unique users who submitted feedback

        res.json({ totalUsers, activeContributors });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user data" });
    }
});

// ✅ Get Recent Activity
router.get("/recent-activity", isAdminMiddleware, async (req, res) => {
    try {
        const recentFeedback = await Feedback.find().sort({ createdAt: -1 }).limit(5);
        res.json(recentFeedback);
    } catch (error) {
        res.status(500).json({ message: "Error fetching recent activity" });
    }
});

module.exports = router;
