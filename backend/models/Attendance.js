module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    check_in: {
      type: DataTypes.DATE
    },
    check_out: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late', 'half_day'),
      defaultValue: 'present'
    },
    working_hours: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    overtime: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    notes: {
      type: DataTypes.TEXT
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'attendances',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'date']
      }
    ]
  });

  return Attendance;
};