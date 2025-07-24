const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    feedbackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    commentText: { type: String, required: true },
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

// In models/Comment.js
module.exports = mongoose.model('Comment', commentSchema);
