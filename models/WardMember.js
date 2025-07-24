// models/WardMember.js
const mongoose = require('mongoose');

const wardMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    wardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ward',
        required: true
    }
}, {
    timestamps: true
});

const WardMember = mongoose.model('WardMember', wardMemberSchema);

module.exports = WardMember;
