const Feedback = require('../models/Feedback');

// Fetch all feedback (for admin dashboard)
const getAllFeedback = async (req, res) => {
    try {
        // Retrieve all feedback and populate the userId field with user details
        const feedbacks = await Feedback.find().populate('userId', 'username email');
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error('🔥 Error fetching feedback:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update feedback status (for admin dashboard)
const updateFeedbackStatus = async (req, res) => {
    const { id } = req.params; // Feedback ID
    const { status } = req.body; // New status

    // Validate status
    if (!['Pending', 'Resolved', 'In Progress'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    try {
        // Find feedback by ID and update its status
        const updatedFeedback = await Feedback.findByIdAndUpdate(
            id,
            { status },
            { new: true } // Return the updated document
        );

        if (!updatedFeedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.status(200).json({ message: 'Feedback status updated successfully', feedback: updatedFeedback });
    } catch (error) {
        console.error('🔥 Error updating feedback status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getAllFeedback, updateFeedbackStatus };