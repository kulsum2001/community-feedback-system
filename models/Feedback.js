// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    location: {
        type: { type: String, default: 'Point' }, // Default type is 'Point'
        coordinates: { type: [Number], default: [0, 0] } // Default coordinates
    },
    status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending'
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);