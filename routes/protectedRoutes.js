const express = require('express');
const router = express.Router();
const auth = require('../auth'); // Import the auth middleware
const User = require('../models/User'); // Assuming you have the User model

// Protected route to get user data
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId); // Use req.user.userId from the token
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add other protected routes as needed, using the 'auth' middleware

module.exports = router;

