module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    department_id: {
      type: DataTypes.UUID,
      references: {
        model: 'departments',
        key: 'id'
      }
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^[0-9+\-\s()]+$/
      }
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: 0
      }
    },
    employment_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    },
    manager_id: {
      type: DataTypes.UUID,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'on_leave', 'terminated'),
      defaultValue: 'active'
    },
    employee_code: {
      type: DataTypes.STRING,
      unique: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'employees',
    timestamps: false,
    underscored: true
  });

  return Employee;
};