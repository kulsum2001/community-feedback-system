const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const feedbackController = require('../controllers/feedbackController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.use(express.json());

// ✅ Register (unchanged)
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Login (updated token payload)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // ✅ Allow both admins & normal users to log in
        const tokenPayload = { 
            sub: user._id.toString(),
            role: user.role // ✅ Include role in the JWT
        };
        
        
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            userId: user._id.toString()
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});



// ✅ Only mount feedback route if defined (unchanged)
if (feedbackController && typeof feedbackController.createFeedback === 'function') {
    router.post('/feedback', verifyToken, feedbackController.createFeedback);
} else {
    console.warn('⚠️ Skipping feedback route — createFeedback not found.');
}

module.exports = router;