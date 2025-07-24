const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'default_secret'
};

passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            console.log('JWT Payload:', jwt_payload);
            const user = await User.findById(jwt_payload.sub);
            if (!user) return done(null, false);
            return done(null, user); // ✅ Allow both admins and users
        } catch (error) {
            return done(error, false);
        }
    })
);

const authMiddleware = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err.message });
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized! Please log in.' });
        }
        req.user = user; // ✅ Attach user to req.user
        next();
    })(req, res, next);
};

module.exports = authMiddleware;
