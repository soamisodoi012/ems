const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;
  
  console.log('=== PROTECT MIDDLEWARE ===');
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token present');
  }

  if (!token) {
    console.log('No token');
    return res.status(401).json({
      status: 'fail',
      message: 'You are not logged in'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded user ID:', decoded.id);
    
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists'
      });
    }
    
    req.user = user;
    console.log('User attached to req.user:', req.user.id);
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token'
    });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission'
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };