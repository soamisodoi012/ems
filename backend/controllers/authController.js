const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '90d'
  });
};

exports.login = async (req, res) => {
  console.log('=== LOGIN ===');
  console.log('Email:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }
    
    const token = signToken(user.id);
    
    // Remove password from output
    const userData = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    };
    
    console.log('Login successful for:', user.email);
    
    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: userData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  console.log('=== GET ME ===');
  console.log('req.user:', req.user);
  
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authenticated'
      });
    }
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    const userData = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    };
    
    console.log('User data sent for:', user.email);
    
    res.status(200).json({
      status: 'success',
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'User already exists'
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await User.create({
      full_name,
      email,
      password: hashedPassword,
      role: role || 'employee'
    });
    
    const token = signToken(user.id);
    
    const userData = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    };
    
    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: userData
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    const user = await User.findByPk(req.user.id);
    
    const isPasswordCorrect = await bcrypt.compare(current_password, user.password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'Current password is incorrect'
      });
    }
    
    user.password = await bcrypt.hash(new_password, 12);
    await user.save();
    
    const token = signToken(user.id);
    
    const userData = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: userData
      }
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};