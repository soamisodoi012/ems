const { Attendance, Employee } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');

exports.checkIn = async (req, res, next) => {
  try {
    // Determine which employee to check in
    let employee_id;
    
    if (req.user.role === 'employee') {
      // Employee can only check in for themselves
      employee_id = req.user.employee_id;
      if (!employee_id) {
        return next(new AppError('No employee record linked to your account. Please contact admin.', 400));
      }
    } else {
      // Admin/Manager can check in for themselves or specify an employee
      employee_id = req.body.employee_id || req.user.employee_id;
      if (!employee_id) {
        return next(new AppError('Employee ID is required', 400));
      }
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if employee exists
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }
    
    // Check permission for managers (can only check in for their department)
    if (req.user.role === 'manager' && req.body.employee_id) {
      const managerEmployee = await Employee.findByPk(req.user.employee_id);
      if (employee.department_id !== managerEmployee.department_id) {
        return next(new AppError('You can only check in for employees in your department', 403));
      }
    }
    
    let attendance = await Attendance.findOne({
      where: {
        employee_id,
        date: today
      }
    });

    if (attendance && attendance.check_in) {
      return next(new AppError('Already checked in today.', 400));
    }

    const checkInTime = new Date();
    let status = 'present';
    
    // Check if late (after 9:00 AM)
    const hour = checkInTime.getHours();
    const minutes = checkInTime.getMinutes();
    
    if (hour > 9 || (hour === 9 && minutes > 0)) {
      status = 'late';
    }

    if (attendance) {
      // Update existing record
      attendance.check_in = checkInTime;
      attendance.status = status;
      await attendance.save();
    } else {
      // Create new record
      attendance = await Attendance.create({
        employee_id,
        date: today,
        check_in: checkInTime,
        status
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Successfully checked in',
      data: { 
        attendance,
        check_in_time: checkInTime,
        status: status
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    next(error);
  }
};

exports.checkOut = async (req, res, next) => {
  try {
    // Determine which employee to check out
    let employee_id;
    
    if (req.user.role === 'employee') {
      employee_id = req.user.employee_id;
      if (!employee_id) {
        return next(new AppError('No employee record linked to your account. Please contact admin.', 400));
      }
    } else {
      employee_id = req.body.employee_id || req.user.employee_id;
      if (!employee_id) {
        return next(new AppError('Employee ID is required', 400));
      }
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if employee exists
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }
    
    // Check permission for managers
    if (req.user.role === 'manager' && req.body.employee_id) {
      const managerEmployee = await Employee.findByPk(req.user.employee_id);
      if (employee.department_id !== managerEmployee.department_id) {
        return next(new AppError('You can only check out for employees in your department', 403));
      }
    }
    
    const attendance = await Attendance.findOne({
      where: {
        employee_id,
        date: today
      }
    });

    if (!attendance || !attendance.check_in) {
      return next(new AppError('No check-in record found for today. Please check in first.', 404));
    }

    if (attendance.check_out) {
      return next(new AppError('Already checked out today.', 400));
    }

    attendance.check_out = new Date();
    
    // Calculate working hours
    const checkInTime = new Date(attendance.check_in);
    const checkOutTime = new Date(attendance.check_out);
    const workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    attendance.working_hours = parseFloat(workingHours.toFixed(2));
    
    // Calculate overtime (if more than 8 hours)
    if (workingHours > 8) {
      attendance.overtime = parseFloat((workingHours - 8).toFixed(2));
    }
    
    await attendance.save();

    res.status(200).json({
      status: 'success',
      message: 'Successfully checked out',
      data: { 
        attendance,
        check_out_time: attendance.check_out,
        working_hours: attendance.working_hours,
        overtime: attendance.overtime
      }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    next(error);
  }
};

exports.getAttendance = async (req, res, next) => {
  try {
    const { employee_id, date, start_date, end_date, status } = req.query;
    
    let where = {};
    
    // Determine which employee's attendance to fetch
    if (employee_id) {
      // Check permission for viewing others' attendance
      if (req.user.role === 'employee' && req.user.employee_id !== employee_id) {
        return next(new AppError('You can only view your own attendance.', 403));
      }
      if (req.user.role === 'manager') {
        const employee = await Employee.findByPk(employee_id);
        if (employee && employee.department_id !== req.user.employee?.department_id) {
          return next(new AppError('You can only view attendance for your department.', 403));
        }
      }
      where.employee_id = employee_id;
    } else if (req.user.role === 'employee') {
      where.employee_id = req.user.employee_id;
    } else if (req.user.role === 'manager' && req.user.employee) {
      const employees = await Employee.findAll({ 
        where: { department_id: req.user.employee.department_id },
        attributes: ['id']
      });
      if (employees.length > 0) {
        where.employee_id = employees.map(e => e.id);
      }
    }
    
    // Date filtering
    if (date) {
      where.date = date;
    } else if (start_date && end_date) {
      where.date = {
        [Op.between]: [start_date, end_date]
      };
    }
    
    if (status) where.status = status;

    const attendance = await Attendance.findAll({
      where,
      include: [{ 
        model: Employee, 
        as: 'employee',
        attributes: ['id', 'full_name', 'employee_code', 'position', 'department_id'],
        include: ['department']
      }],
      order: [['date', 'DESC'], ['check_in', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    next(error);
  }
};