module.exports = (sequelize, DataTypes) => {
  const Leave = sequelize.define('Leave', {
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
    leave_type: {
      type: DataTypes.ENUM('sick', 'vacation', 'personal', 'unpaid', 'maternity', 'paternity', 'bereavement'),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    total_days: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
      defaultValue: 'pending'
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    approved_date: {
      type: DataTypes.DATE
    },
    rejection_reason: {
      type: DataTypes.TEXT
    },
    attachment_url: {
      type: DataTypes.STRING
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
    tableName: 'leaves',
    timestamps: false,
    underscored: true
  });

  return Leave;
};