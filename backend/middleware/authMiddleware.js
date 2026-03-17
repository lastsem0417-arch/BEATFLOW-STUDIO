const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'ARYAN_STUDIO_SECRET_123';

// 🛡️ 1. PROTECT ROUTE (Checks if user is logged in)
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verification using the same secret
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
         return res.status(401).json({ message: 'User not found in database' });
      }

      return next(); 
      
    } catch (error) {
      console.error("🛑 JWT Bouncer Error:", error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 👑 2. THE ADMIN GATEKEEPER (Strictly for God Mode)
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Entry Granted
  } else {
    res.status(403).json({ message: '🚨 ACCESS DENIED: GOD MODE ONLY' });
  }
};

// 🎭 3. DYNAMIC ROLE AUTHORIZATION (Tera original awesome logic)
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user ? req.user.role : 'N/A'}) is not authorized.` 
      });
    }
    return next();
  };
};