const { Leave, Employee, LeaveBalance, LeaveAccrualLog } = require('../models');
const AppError = require('../utils/AppError');
const LeaveAccrualService = require('../services/leaveAccrualService');

// Apply for leave
exports.applyLeave = async (req, res, next) => {
  try {
    const { employee_id, leave_type, start_date, end_date, reason, attachment_url } = req.body;
    
    // Check permission
    if (req.user.role === 'employee' && req.user.employee_id !== employee_id) {
      return next(new AppError('You can only apply leave for yourself.', 403));
    }
    
    // Calculate total days
    const start = new Date(start_date);
    const end = new Date(end_date);
    const total_days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Get leave balance for non-unpaid leaves
    if (leave_type !== 'unpaid') {
      const balance = await LeaveBalance.findOne({
        where: { employee_id }
      });
      
      if (!balance) {
        return next(new AppError('Leave balance not found. Please contact HR.', 404));
      }
      
      let availableBalance = 0;
      switch (leave_type) {
        case 'vacation':
          availableBalance = parseFloat(balance.vacation_balance);
          break;
        case 'sick':
          availableBalance = parseFloat(balance.sick_balance);
          break;
        case 'personal':
          availableBalance = parseFloat(balance.personal_balance);
          break;
      }
      
      if (total_days > availableBalance) {
        return next(new AppError(`Insufficient ${leave_type} leave balance. Available: ${availableBalance} days, Requested: ${total_days} days`, 400));
      }
    }
    
    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      where: {
        employee_id,
        status: { [Op.ne]: 'rejected' },
        [Op.or]: [
          {
            start_date: { [Op.between]: [start_date, end_date] }
          },
          {
            end_date: { [Op.between]: [start_date, end_date] }
          },
          {
            [Op.and]: [
              { start_date: { [Op.lte]: start_date } },
              { end_date: { [Op.gte]: end_date } }
            ]
          }
        ]
      }
    });
    
    if (overlappingLeave) {
      return next(new AppError('You already have a leave request for this period.', 400));
    }
    
    const leave = await Leave.create({
      employee_id,
      leave_type,
      start_date,
      end_date,
      total_days,
      reason,
      attachment_url,
      status: 'pending'
    });
    
    res.status(201).json({
      status: 'success',
      data: { leave }
    });
  } catch (error) {
    next(error);
  }
};

// Get all leaves
exports.getLeaves = async (req, res, next) => {
  try {
    const { employee_id, status, start_date, end_date } = req.query;
    
    let where = {};
    
    if (employee_id) {
      // Check permission
      if (req.user.role === 'employee' && req.user.employee_id !== employee_id) {
        return next(new AppError('You can only view your own leaves.', 403));
      }
      if (req.user.role === 'manager' && req.user.employee_id !== employee_id) {
        const employee = await Employee.findByPk(employee_id);
        if (employee && employee.department_id !== req.user.employee.department_id) {
          return next(new AppError('You can only view leaves for your department.', 403));
        }
      }
      where.employee_id = employee_id;
    } else if (req.user.role === 'employee') {
      where.employee_id = req.user.employee_id;
    } else if (req.user.role === 'manager') {
      const employees = await Employee.findAll({ 
        where: { department_id: req.user.employee.department_id },
        attributes: ['id']
      });
      where.employee_id = employees.map(e => e.id);
    }
    
    if (status) where.status = status;
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [start_date, end_date]
      };
    }
    
    const leaves = await Leave.findAll({
      where,
      include: [
        { 
          model: Employee, 
          as: 'employee',
          attributes: ['id', 'full_name', 'employee_code', 'position', 'department_id'],
          include: ['department']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({
      status: 'success',
      data: { leaves }
    });
  } catch (error) {
    next(error);
  }
};

// Get leave by ID
exports.getLeaveById = async (req, res, next) => {
  try {
    const leave = await Leave.findByPk(req.params.id, {
      include: [
        { model: Employee, as: 'employee', include: ['department'] }
      ]
    });
    
    if (!leave) {
      return next(new AppError('Leave request not found.', 404));
    }
    
    // Check permission
    if (req.user.role === 'employee' && req.user.employee_id !== leave.employee_id) {
      return next(new AppError('You can only view your own leave requests.', 403));
    }
    
    if (req.user.role === 'manager') {
      const employee = await Employee.findByPk(leave.employee_id);
      if (employee && employee.department_id !== req.user.employee.department_id) {
        return next(new AppError('You can only view leaves for your department.', 403));
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: { leave }
    });
  } catch (error) {
    next(error);
  }
};

// Approve or reject leave
exports.approveLeave = async (req, res, next) => {
  try {
    const { status, rejection_reason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return next(new AppError('Invalid status. Must be approved or rejected.', 400));
    }
    
    const leave = await Leave.findByPk(req.params.id);
    
    if (!leave) {
      return next(new AppError('Leave request not found.', 404));
    }
    
    // Check permission
    if (req.user.role === 'manager') {
      const employee = await Employee.findByPk(leave.employee_id);
      if (employee && employee.department_id !== req.user.employee.department_id) {
        return next(new AppError('You can only approve leaves for your department.', 403));
      }
    } else if (req.user.role !== 'admin') {
      return next(new AppError('Only managers or admin can approve leaves.', 403));
    }
    
    // If approving, deduct from balance
    if (status === 'approved' && leave.status !== 'approved') {
      const balance = await LeaveBalance.findOne({
        where: { employee_id: leave.employee_id }
      });
      
      if (balance && leave.leave_type !== 'unpaid') {
        let updateField = '';
        let usedField = '';
        
        switch (leave.leave_type) {
          case 'vacation':
            updateField = 'vacation_balance';
            usedField = 'vacation_used';
            break;
          case 'sick':
            updateField = 'sick_balance';
            usedField = 'sick_used';
            break;
          case 'personal':
            updateField = 'personal_balance';
            usedField = 'personal_used';
            break;
        }
        
        if (updateField) {
          const currentBalance = parseFloat(balance[updateField]);
          const currentUsed = parseFloat(balance[usedField] || 0);
          
          if (currentBalance < leave.total_days) {
            return next(new AppError(`Insufficient balance. Available: ${currentBalance} days`, 400));
          }
          
          await balance.update({
            [updateField]: currentBalance - leave.total_days,
            [usedField]: currentUsed + leave.total_days,
            updated_at: new Date()
          });
        }
      }
    }
    
    leave.status = status;
    leave.approved_by = req.user.employee_id;
    leave.approved_date = new Date();
    if (status === 'rejected') {
      leave.rejection_reason = rejection_reason;
    }
    
    await leave.save();
    
    res.status(200).json({
      status: 'success',
      data: { leave }
    });
  } catch (error) {
    next(error);
  }
};

// Cancel leave
exports.cancelLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findByPk(req.params.id);
    
    if (!leave) {
      return next(new AppError('Leave request not found.', 404));
    }
    
    // Check permission
    if (req.user.role === 'employee' && req.user.employee_id !== leave.employee_id) {
      return next(new AppError('You can only cancel your own leave requests.', 403));
    }
    
    if (leave.status !== 'pending') {
      return next(new AppError('Only pending leave requests can be cancelled.', 400));
    }
    
    leave.status = 'cancelled';
    await leave.save();
    
    res.status(200).json({
      status: 'success',
      data: { leave }
    });
  } catch (error) {
    next(error);
  }
};

// Get leave balance
exports.getLeaveBalance = async (req, res, next) => {
  try {
    const { employee_id } = req.params;
    
    // Check permission
    if (req.user.role === 'employee' && req.user.employee_id !== employee_id) {
      return next(new AppError('You can only view your own balance.', 403));
    }
    
    const summary = await LeaveAccrualService.getEmployeeLeaveSummary(employee_id);
    
    if (!summary) {
      return next(new AppError('Leave balance not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// Manual accrual (admin only)
exports.manualAccrual = async (req, res, next) => {
  try {
    // Only admin can do manual accruals
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admin can perform manual accruals.', 403));
    }
    
    const { employee_id, leave_type, days, notes } = req.body;
    
    const result = await LeaveAccrualService.manualAccrual(
      employee_id,
      leave_type,
      parseFloat(days),
      notes,
      req.user.id
    );
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Run monthly accrual (admin only)
exports.runMonthlyAccrual = async (req, res, next) => {
  try {
    // Only admin can trigger manual accrual run
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admin can trigger accrual manually.', 403));
    }
    
    const result = await LeaveAccrualService.processMonthlyAccrual();
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};