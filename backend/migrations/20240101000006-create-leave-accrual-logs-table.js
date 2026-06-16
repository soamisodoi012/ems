'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('leave_accrual_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      employee_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      accrual_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      leave_type: {
        type: Sequelize.ENUM('vacation', 'sick', 'personal'),
        allowNull: false
      },
      days_accrued: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      previous_balance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      new_balance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      accrual_month: {
        type: Sequelize.INTEGER
      },
      accrual_year: {
        type: Sequelize.INTEGER
      },
      notes: {
        type: Sequelize.TEXT
      },
      processed_by: {
        type: Sequelize.STRING,
        defaultValue: 'system'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('leave_accrual_logs', ['employee_id', 'accrual_date']);
    await queryInterface.addIndex('leave_accrual_logs', ['accrual_year', 'accrual_month']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('leave_accrual_logs');
  }
};