const bcrypt = require('bcryptjs');
const { User, Employee } = require('../models'); // Change from '../models/Associations' to '../models'
const AppError = require('../utils/AppError');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Employee,
        as: 'employee'
      }]
    });
    
    users.forEach(user => user.password = undefined);
    
    res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{
        model: Employee,
        as: 'employee'
      }]
    });
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    user.password = undefined;
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Error in getUser:', error);
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { full_name, email, password, role, employee_id } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new AppError('User already exists with that email.', 400));
    }
    
    // Check if employee exists
    if (employee_id) {
      const employee = await Employee.findByPk(employee_id);
      if (!employee) {
        return next(new AppError('Employee not found.', 404));
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await User.create({
      full_name,
      email,
      password: hashedPassword,
      role: role || 'employee',
      employee_id: employee_id || null
    });
    
    user.password = undefined;
    
    res.status(201).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    const { role, is_active } = req.body;
    
    if (role) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;
    
    await user.save();
    user.password = undefined;
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    await user.destroy();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    next(error);
  }
};

exports.createUserForEmployee = async (req, res, next) => {
  try {
    const { employee_id } = req.params;
    const { full_name, email, password, role } = req.body;
    
    // Check if employee exists
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return next(new AppError('Employee not found.', 404));
    }
    
    // Check if user already exists for this employee
    const existingUser = await User.findOne({ where: { employee_id } });
    if (existingUser) {
      return next(new AppError('User already exists for this employee.', 400));
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await User.create({
      full_name: full_name || employee.full_name,
      email: email || employee.email,
      password: hashedPassword,
      role: role || 'employee',
      employee_id
    });
    
    user.password = undefined;
    
    res.status(201).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Error in createUserForEmployee:', error);
    next(error);
  }
};