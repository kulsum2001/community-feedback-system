const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];  // Extract token from request header
    if (!token) return res.status(401).json({ message: 'Access denied' });  // If no token, deny access

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);  // Verify token with the secret
        req.user = verified;  // Attach user data to the request object
        next();  // Move to the next middleware or route handler
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });  // If token is invalid
    }
};

module.exports = auth;  // Export the middleware
