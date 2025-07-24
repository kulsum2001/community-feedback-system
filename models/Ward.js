const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
    wardName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ward', wardSchema);