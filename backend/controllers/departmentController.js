const { Department, Employee } = require('../models');
const AppError = require('../utils/AppError');

exports.getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      include: [
        { 
          model: Employee, 
          as: 'employees', 
          attributes: ['id', 'full_name', 'position', 'email'],
          required: false,
          limit: 5
        }
      ]
    });

    // Count employees per department
    const departmentsWithCount = await Promise.all(departments.map(async (dept) => {
      const count = await Employee.count({ where: { department_id: dept.id } });
      return {
        ...dept.toJSON(),
        employee_count: count
      };
    }));

    res.status(200).json({
      status: 'success',
      data: { departments: departmentsWithCount }
    });
  } catch (error) {
    next(error);
  }
};

exports.getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [
        { model: Employee, as: 'employees', attributes: ['id', 'full_name', 'position', 'email', 'phone'] }
      ]
    });

    if (!department) {
      return next(new AppError('Department not found.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { department }
    });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admin can create departments.', 403));
    }

    const department = await Department.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { department }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admin can update departments.', 403));
    }

    const department = await Department.findByPk(req.params.id);
    
    if (!department) {
      return next(new AppError('Department not found.', 404));
    }

    await department.update(req.body);
    
    res.status(200).json({
      status: 'success',
      data: { department }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admin can delete departments.', 403));
    }

    const department = await Department.findByPk(req.params.id);
    
    if (!department) {
      return next(new AppError('Department not found.', 404));
    }

    const employeeCount = await Employee.count({ where: { department_id: req.params.id } });
    if (employeeCount > 0) {
      return next(new AppError(`Cannot delete department with ${employeeCount} employees. Reassign or delete employees first.`, 400));
    }

    await department.destroy();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};