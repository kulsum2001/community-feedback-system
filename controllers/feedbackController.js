const Feedback = require('../models/Feedback');
const User = require('../models/User');
const mongoose = require('mongoose');

// ✅ Create Feedback (with location parsing fix)
const createFeedback = async (req, res) => {
    try {
        console.log("📥 Incoming Request Body:", req.body);
        console.log("📷 Uploaded Files:", req.files);

        if (!req.body) {
            console.log("🚨 req.body is UNDEFINED!");
            return res.status(400).json({ success: false, message: "Request body is missing!" });
        }

        // Extract form fields
        const { userId, title, category, description, location } = req.body;
        const images = req.files ? req.files.map(file => file.path) : []; // Extract image file paths

        // Validate required fields
        if (!userId || !title || !category || !description) {
            console.log("🚨 Missing fields:", { userId, title, category, description });
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log("🚨 Invalid userId format:", userId);
            return res.status(400).json({ success: false, message: "Invalid userId format" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            console.log("🚨 User not found:", userId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ✅ Ensure location is correctly parsed
        let parsedLocation;
    try {
    parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    } catch (error) {
    console.error("🚨 Error parsing location:", error);
    return res.status(400).json({ success: false, message: "Invalid location format" });
    }


        // ✅ Validate location format
        if (!parsedLocation || !parsedLocation.type || !Array.isArray(parsedLocation.coordinates)) {
            return res.status(400).json({ success: false, message: "Invalid location format" });
        }

        // Create new feedback entry
        const feedback = new Feedback({
            userId,
            title,
            category,
            description,
            images,
            location: parsedLocation
        });

        await feedback.save();
        console.log("✅ Feedback saved successfully:", feedback._id);

        // ✅ Store the created feedback in res.locals
        res.locals.feedback = feedback; 

        return res.status(201).json({ success: true, message: "Feedback submitted successfully", feedback });

    } catch (error) {
        console.error("🔥 Internal server error:", error.message);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};



// ✅ Fetch ALL feedback
const getAllFeedback = async (req, res) => {
    try {
        console.log("📤 Fetching all feedback...");

        const feedbacks = await Feedback.find()
            .populate('userId', 'name email') // Fetch user name & email
            .sort({ createdAt: -1 })
            .lean(); // Optimize for read performance

        console.log(`✅ Retrieved ${feedbacks.length} feedback entries`);

        return res.status(200).json({ 
            success: true, 
            message: feedbacks.length ? "All feedback retrieved successfully" : "No feedback available",
            data: feedbacks 
        });

    } catch (error) {
        console.error("🔥 Error fetching all feedback:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ✅ Fetch feedback by userId
const getFeedbackByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid userId format" });
        }

        console.log(`📤 Fetching feedback for user: ${userId}`);

        const feedbacks = await Feedback.find({ userId }).sort({ createdAt: -1 });

        console.log(`✅ Retrieved ${feedbacks.length} feedbacks for user: ${userId}`);

        return res.status(200).json({ 
            success: true, 
            message: feedbacks.length ? "User feedback retrieved successfully" : "No feedback available for this user",
            feedbacks 
        });

    } catch (error) {
        console.error("🔥 Error fetching user feedback:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
const getFeedbackStats = async (req, res) => {
    try {
        const total = await Feedback.countDocuments({});
        const pending = await Feedback.countDocuments({ status: 'pending' });
        const resolved = await Feedback.countDocuments({ status: 'resolved' });

        res.json({ success: true, total, pending, resolved });
    } catch (err) {
        console.error("Error getting feedback stats:", err.message);
        res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
};
// ✅ Mark Feedback as Resolved
const markFeedbackResolved = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid feedback ID' });
        }

        // Update feedback status to 'resolved'
        const updatedFeedback = await Feedback.findByIdAndUpdate(
            id,
            { status: 'resolved' },
            { new: true }
        );

        if (!updatedFeedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        return res.status(200).json({ success: true, message: 'Feedback marked as resolved', data: updatedFeedback });

    } catch (err) {
        console.error('Error resolving feedback:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


// ✅ Export controllers
module.exports = { createFeedback, getAllFeedback, getFeedbackByUser, getFeedbackStats, markFeedbackResolved };
