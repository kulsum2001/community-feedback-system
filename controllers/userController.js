const User = require('../models/User');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

// ✅ Register User
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // ✅ Input Validation
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ username, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully', 
            token, 
            userId: user._id.toString() 
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        console.log("Incoming Password (RAW):", req.body.password);
        console.log("Stored Password (DB):", user.password);

        const isMatch = await bcrypt.compare(req.body.password.trim(), user.password.trim());
        console.log("Password Match Status:", isMatch);

        if (!isMatch) {
            console.log("❌ Password Mismatch");
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            userId: user._id.toString()
        });

    } catch (error) {
        console.error('🔥 Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ✅ Export controllers
module.exports = { registerUser, loginUser };
