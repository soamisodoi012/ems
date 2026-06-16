const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Sequelize with database connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Define all models
const User = require('./User')(sequelize, DataTypes);
const Department = require('./Department')(sequelize, DataTypes);
const Employee = require('./Employee')(sequelize, DataTypes);
const Attendance = require('./Attendance')(sequelize, DataTypes);
const Leave = require('./Leave')(sequelize, DataTypes);
const LeaveBalance = require('./LeaveBalance')(sequelize, DataTypes);
const LeaveAccrualLog = require('./LeaveAccrualLog')(sequelize, DataTypes);

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

// Employee to LeaveBalance (One-to-One)
Employee.hasOne(LeaveBalance, {
  foreignKey: 'employee_id',
  as: 'leave_balance',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
LeaveBalance.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

// Employee to LeaveAccrualLog (One-to-Many)
Employee.hasMany(LeaveAccrualLog, {
  foreignKey: 'employee_id',
  as: 'accrual_logs',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
LeaveAccrualLog.belongsTo(Employee, {
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
  Sequelize,
  User,
  Department,
  Employee,
  Attendance,
  Leave,
  LeaveBalance,
  LeaveAccrualLog
};