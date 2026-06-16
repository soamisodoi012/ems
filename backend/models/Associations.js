const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define all models
const User = require('./User')(sequelize, DataTypes);
const Department = require('./Department')(sequelize, DataTypes);
const Employee = require('./Employee')(sequelize, DataTypes);
const Attendance = require('./Attendance')(sequelize, DataTypes);
const Leave = require('./Leave')(sequelize, DataTypes);

// ============= DEFINE ALL RELATIONSHIPS =============

// Department to Employee (One-to-Many)
Department.hasMany(Employee, { 
  foreignKey: 'department_id', 
  as: 'employees',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Employee.belongsTo(Department, { 
  foreignKey: 'department_id', 
  as: 'department' 
});

// Employee to User (One-to-One)
Employee.hasOne(User, { 
  foreignKey: 'employee_id', 
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
User.belongsTo(Employee, { 
  foreignKey: 'employee_id', 
  as: 'employee' 
});

// Employee to Attendance (One-to-Many)
Employee.hasMany(Attendance, { 
  foreignKey: 'employee_id', 
  as: 'attendances',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Attendance.belongsTo(Employee, { 
  foreignKey: 'employee_id', 
  as: 'employee' 
});

// Employee to Leave (One-to-Many)
Employee.hasMany(Leave, { 
  foreignKey: 'employee_id', 
  as: 'leaves',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Leave.belongsTo(Employee, { 
  foreignKey: 'employee_id', 
  as: 'employee' 
});

// Manager relationships (Self-reference for Employee)
Employee.belongsTo(Employee, { 
  as: 'manager', 
  foreignKey: 'manager_id' 
});
Employee.hasMany(Employee, { 
  as: 'subordinates', 
  foreignKey: 'manager_id' 
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Department,
  Employee,
  Attendance,
  Leave
};