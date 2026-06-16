module.exports = (sequelize, DataTypes) => {
  const LeaveBalance = sequelize.define('LeaveBalance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    employee_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    // Vacation leave balances
    vacation_total_accrued: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Total vacation days accrued since employment'
    },
    vacation_used: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Total vacation days used'
    },
    vacation_balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Current available vacation days'
    },
    // Sick leave balances
    sick_total_accrued: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Total sick days accrued since employment'
    },
    sick_used: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Total sick days used'
    },
    sick_balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Current available sick days'
    },
    // Personal leave balances
    personal_total_accrued: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Total personal days accrued'
    },
    personal_used: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Total personal days used'
    },
    personal_balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Current available personal days'
    },
    // Accrual tracking
    last_accrual_date: {
      type: DataTypes.DATEONLY,
      comment: 'Last date when leave was accrued'
    },
    next_accrual_date: {
      type: DataTypes.DATEONLY,
      comment: 'Next scheduled accrual date'
    },
    accrual_rate_vacation: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 1.25,
      comment: 'Days accrued per month (default 1.25 = 15 days/year)'
    },
    accrual_rate_sick: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 1,
      comment: 'Sick days accrued per month (default 1 = 12 days/year)'
    },
    accrual_rate_personal: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.5,
      comment: 'Personal days accrued per month (default 0.5 = 6 days/year)'
    },
    max_vacation_balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 30,
      comment: 'Maximum vacation days that can be carried over'
    },
    year: {
      type: DataTypes.INTEGER,
      comment: 'Current year for balance tracking'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'leave_balances',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'year']
      }
    ]
  });

  return LeaveBalance;
};