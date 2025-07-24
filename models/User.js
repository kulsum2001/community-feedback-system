const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true }); // ✅ Auto updates createdAt & updatedAt

// ✅ Compare password method (NO TRIMMING to prevent mismatch)
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
