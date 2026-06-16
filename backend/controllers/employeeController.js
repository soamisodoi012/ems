// const { Op } = require('sequelize');
// const { Employee, Department, User, LeaveBalance } = require('../models/Associations');
// const AppError = require('../utils/AppError');

// exports.getAllEmployees = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10, department_id, status, search } = req.query;
//     const offset = (page - 1) * limit;
    
//     let where = {};
    
//     if (department_id) where.department_id = department_id;
//     if (status) where.status = status;
//     if (search) {
//       where[Op.or] = [
//         { full_name: { [Op.iLike]: `%${search}%` } },
//         { email: { [Op.iLike]: `%${search}%` } },
//         { employee_code: { [Op.iLike]: `%${search}%` } },
//         { position: { [Op.iLike]: `%${search}%` } }
//       ];
//     }

//     // If manager, only show employees in their department
//     if (req.user.role === 'manager' && req.user.employee) {
//       where.department_id = req.user.employee.department_id;
//     }

//     const employees = await Employee.findAndCountAll({
//       where,
//       include: [
//         { 
//           model: Department, 
//           as: 'department', 
//           attributes: ['id', 'name'] 
//         },
//         { 
//           model: Employee, 
//           as: 'manager', 
//           attributes: ['id', 'full_name', 'position'],
//           required: false
//         },
//         { 
//           model: User, 
//           as: 'user', 
//           attributes: ['id', 'email', 'role', 'is_active'],
//           required: false
//         }
//       ],
//       limit: parseInt(limit),
//       offset: offset,
//       order: [['created_at', 'DESC']],
//       distinct: true
//     });

//     res.status(200).json({
//       status: 'success',
//       data: {
//         employees: employees.rows,
//         pagination: {
//           total: employees.count,
//           page: parseInt(page),
//           limit: parseInt(limit),
//           totalPages: Math.ceil(employees.count / limit)
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error in getAllEmployees:', error);
//     next(new AppError('Error fetching employees: ' + error.message, 500));
//   }
// };

// exports.getEmployee = async (req, res, next) => {
//   try {
//     const employee = await Employee.findByPk(req.params.id, {
//       include: [
//         { 
//           model: Department, 
//           as: 'department', 
//           attributes: ['id', 'name', 'description'] 
//         },
//         { 
//           model: Employee, 
//           as: 'manager', 
//           attributes: ['id', 'full_name', 'position', 'email'],
//           required: false
//         },
//         { 
//           model: User, 
//           as: 'user', 
//           attributes: ['id', 'email', 'role', 'is_active'],
//           required: false
//         }
//       ]
//     });

//     if (!employee) {
//       return next(new AppError('Employee not found', 404));
//     }

//     // Check permission: managers can only view employees in their department
//     if (req.user.role === 'manager' && req.user.employee) {
//       if (employee.department_id !== req.user.employee.department_id && employee.id !== req.user.employee.id) {
//         return next(new AppError('You do not have permission to view this employee', 403));
//       }
//     }

//     res.status(200).json({
//       status: 'success',
//       data: employee
//     });
//   } catch (error) {
//     console.error('Error in getEmployee:', error);
//     next(new AppError('Error fetching employee: ' + error.message, 500));
//   }
// };

// exports.createEmployee = async (req, res, next) => {
//   try {
//     const { 
//       full_name, 
//       email, 
//       phone, 
//       position, 
//       salary, 
//       employment_date, 
//       department_id, 
//       manager_id,
//       status 
//     } = req.body;

//     // Check if employee with same email exists
//     const existingEmployee = await Employee.findOne({ where: { email } });
//     if (existingEmployee) {
//       return next(new AppError('Employee with this email already exists', 400));
//     }

//     // Generate employee code
//     const employeeCount = await Employee.count();
//     const employee_code = `EMP${String(employeeCount + 1).padStart(4, '0')}`;

//     const employee = await Employee.create({
//       full_name,
//       email,
//       phone,
//       position,
//       salary,
//       employment_date: employment_date || new Date(),
//       department_id: department_id || null,
//       manager_id: manager_id || null,
//       status: status || 'active',
//       employee_code
//     });

//     // Create leave balance for employee
//     await LeaveBalance.create({
//       employee_id: employee.id,
//       vacation_total_accrued: 0,
//       vacation_used: 0,
//       vacation_balance: 0,
//       sick_total_accrued: 0,
//       sick_used: 0,
//       sick_balance: 0,
//       personal_total_accrued: 0,
//       personal_used: 0,
//       personal_balance: 0,
//       year: new Date().getFullYear()
//     });

//     const employeeWithDetails = await Employee.findByPk(employee.id, {
//       include: [
//         { model: Department, as: 'department', attributes: ['id', 'name'] },
//         { model: Employee, as: 'manager', attributes: ['id', 'full_name'] }
//       ]
//     });

//     res.status(201).json({
//       status: 'success',
//       data: employeeWithDetails
//     });
//   } catch (error) {
//     console.error('Error in createEmployee:', error);
//     next(new AppError('Error creating employee: ' + error.message, 500));
//   }
// };

// exports.updateEmployee = async (req, res, next) => {
//   try {
//     const employee = await Employee.findByPk(req.params.id);
    
//     if (!employee) {
//       return next(new AppError('Employee not found', 404));
//     }

//     // Check permission: managers can only update employees in their department
//     if (req.user.role === 'manager' && req.user.employee) {
//       if (employee.department_id !== req.user.employee.department_id && employee.id !== req.user.employee.id) {
//         return next(new AppError('You do not have permission to update this employee', 403));
//       }
//     }

//     const { 
//       full_name, 
//       email, 
//       phone, 
//       position, 
//       salary, 
//       department_id, 
//       manager_id,
//       status 
//     } = req.body;

//     await employee.update({
//       full_name: full_name || employee.full_name,
//       email: email || employee.email,
//       phone: phone || employee.phone,
//       position: position || employee.position,
//       salary: salary || employee.salary,
//       department_id: department_id || employee.department_id,
//       manager_id: manager_id || employee.manager_id,
//       status: status || employee.status
//     });

//     const updatedEmployee = await Employee.findByPk(employee.id, {
//       include: [
//         { model: Department, as: 'department', attributes: ['id', 'name'] },
//         { model: Employee, as: 'manager', attributes: ['id', 'full_name'] }
//       ]
//     });

//     res.status(200).json({
//       status: 'success',
//       data: updatedEmployee
//     });
//   } catch (error) {
//     console.error('Error in updateEmployee:', error);
//     next(new AppError('Error updating employee: ' + error.message, 500));
//   }
// };

// exports.deleteEmployee = async (req, res, next) => {
//   try {
//     const employee = await Employee.findByPk(req.params.id);
    
//     if (!employee) {
//       return next(new AppError('Employee not found', 404));
//     }

//     // Check if employee has associated user account
//     const user = await User.findOne({ where: { employee_id: employee.id } });
//     if (user) {
//       return next(new AppError('Cannot delete employee with an associated user account. Delete the user first.', 400));
//     }

//     await employee.destroy();

//     res.status(204).json({
//       status: 'success',
//       data: null
//     });
//   } catch (error) {
//     console.error('Error in deleteEmployee:', error);
//     next(new AppError('Error deleting employee: ' + error.message, 500));
//   }
// };
const { Op } = require('sequelize');
const { Employee, Department, User, LeaveBalance } = require('../models'); // Changed from Associations to index
const AppError = require('../utils/AppError');

exports.getAllEmployees = async (req, res, next) => {
  try {
    console.log('=== getAllEmployees called ===');
    
    const { page = 1, limit = 10, department_id, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    
    if (department_id) where.department_id = department_id;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { employee_code: { [Op.iLike]: `%${search}%` } },
        { position: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // If manager, only show employees in their department
    if (req.user.role === 'manager' && req.user.employee) {
      where.department_id = req.user.employee.department_id;
    }

    const employees = await Employee.findAndCountAll({
      where,
      include: [
        { 
          model: Department, 
          as: 'department', 
          attributes: ['id', 'name'] 
        },
        { 
          model: Employee, 
          as: 'manager', 
          attributes: ['id', 'full_name', 'position'],
          required: false
        },
        { 
          model: User, 
          as: 'user',  // Make sure this matches the association as defined in index.js
          attributes: ['id', 'email', 'role', 'is_active'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']],
      distinct: true,
      subQuery: false
    });

    res.status(200).json({
      status: 'success',
      data: {
        employees: employees.rows,
        pagination: {
          total: employees.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(employees.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error in getAllEmployees:', error);
    next(new AppError('Error fetching employees: ' + error.message, 500));
  }
};

exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        { 
          model: Department, 
          as: 'department', 
          attributes: ['id', 'name', 'description'] 
        },
        { 
          model: Employee, 
          as: 'manager', 
          attributes: ['id', 'full_name', 'position', 'email'],
          required: false
        },
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'email', 'role', 'is_active'],
          required: false
        },
        {
          model: LeaveBalance,
          as: 'leave_balance',
          required: false
        }
      ]
    });

    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    // Check permission: managers can only view employees in their department
    if (req.user.role === 'manager' && req.user.employee) {
      if (employee.department_id !== req.user.employee.department_id && employee.id !== req.user.employee.id) {
        return next(new AppError('You do not have permission to view this employee', 403));
      }
    }

    res.status(200).json({
      status: 'success',
      data: employee
    });
  } catch (error) {
    console.error('Error in getEmployee:', error);
    next(new AppError('Error fetching employee: ' + error.message, 500));
  }
};

exports.createEmployee = async (req, res, next) => {
  try {
    const { 
      full_name, 
      email, 
      phone, 
      position, 
      salary, 
      employment_date, 
      department_id, 
      manager_id,
      status 
    } = req.body;

    // Check if employee with same email exists
    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      return next(new AppError('Employee with this email already exists', 400));
    }

    // Generate employee code
    const employeeCount = await Employee.count();
    const employee_code = `EMP${String(employeeCount + 1).padStart(4, '0')}`;

    const employee = await Employee.create({
      full_name,
      email,
      phone,
      position,
      salary,
      employment_date: employment_date || new Date(),
      department_id: department_id || null,
      manager_id: manager_id || null,
      status: status || 'active',
      employee_code
    });

    // Create leave balance for employee
    await LeaveBalance.create({
      employee_id: employee.id,
      vacation_total_accrued: 0,
      vacation_used: 0,
      vacation_balance: 0,
      sick_total_accrued: 0,
      sick_used: 0,
      sick_balance: 0,
      personal_total_accrued: 0,
      personal_used: 0,
      personal_balance: 0,
      year: new Date().getFullYear()
    });

    const employeeWithDetails = await Employee.findByPk(employee.id, {
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: Employee, as: 'manager', attributes: ['id', 'full_name'] }
      ]
    });

    res.status(201).json({
      status: 'success',
      data: employeeWithDetails
    });
  } catch (error) {
    console.error('Error in createEmployee:', error);
    next(new AppError('Error creating employee: ' + error.message, 500));
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    // Check permission: managers can only update employees in their department
    if (req.user.role === 'manager' && req.user.employee) {
      if (employee.department_id !== req.user.employee.department_id && employee.id !== req.user.employee.id) {
        return next(new AppError('You do not have permission to update this employee', 403));
      }
    }

    const { 
      full_name, 
      email, 
      phone, 
      position, 
      salary, 
      department_id, 
      manager_id,
      status 
    } = req.body;

    await employee.update({
      full_name: full_name || employee.full_name,
      email: email || employee.email,
      phone: phone || employee.phone,
      position: position || employee.position,
      salary: salary || employee.salary,
      department_id: department_id || employee.department_id,
      manager_id: manager_id || employee.manager_id,
      status: status || employee.status
    });

    const updatedEmployee = await Employee.findByPk(employee.id, {
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: Employee, as: 'manager', attributes: ['id', 'full_name'] }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Error in updateEmployee:', error);
    next(new AppError('Error updating employee: ' + error.message, 500));
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }

    // Check if employee has associated user account
    const user = await User.findOne({ where: { employee_id: employee.id } });
    if (user) {
      return next(new AppError('Cannot delete employee with an associated user account. Delete the user first.', 400));
    }

    await employee.destroy();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error in deleteEmployee:', error);
    next(new AppError('Error deleting employee: ' + error.message, 500));
  }
};