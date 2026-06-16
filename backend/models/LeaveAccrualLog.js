module.exports = (sequelize, DataTypes) => {
  const LeaveAccrualLog = sequelize.define('LeaveAccrualLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    employee_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    accrual_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Date when accrual happened'
    },
    leave_type: {
      type: DataTypes.ENUM('vacation', 'sick', 'personal'),
      allowNull: false
    },
    days_accrued: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: 'Number of days added'
    },
    previous_balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Balance before accrual'
    },
    new_balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Balance after accrual'
    },
    accrual_month: {
      type: DataTypes.INTEGER,
      comment: 'Month of accrual (1-12)'
    },
    accrual_year: {
      type: DataTypes.INTEGER,
      comment: 'Year of accrual'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: 'Additional notes about this accrual'
    },
    processed_by: {
      type: DataTypes.STRING,
      defaultValue: 'system',
      comment: 'Who/what processed this accrual (system or admin)'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'leave_accrual_logs',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ['employee_id', 'accrual_date']
      },
      {
        fields: ['accrual_year', 'accrual_month']
      }
    ]
  });

  return LeaveAccrualLog;
};