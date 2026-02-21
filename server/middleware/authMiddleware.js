const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Accept token from Authorization header OR ?token= query param
    // (query param is needed when opening routes in a new browser tab, e.g. invoice)
    const headerToken = req.headers.authorization?.split(' ')[1];
    const queryToken = req.query.token;
    const token = headerToken || queryToken;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
