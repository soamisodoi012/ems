'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('leave_balances', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      employee_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vacation_total_accrued: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      vacation_used: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      vacation_balance: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      sick_total_accrued: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      sick_used: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      sick_balance: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      personal_total_accrued: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      personal_used: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      personal_balance: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      last_accrual_date: {
        type: Sequelize.DATEONLY
      },
      next_accrual_date: {
        type: Sequelize.DATEONLY
      },
      accrual_rate_vacation: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 1.25
      },
      accrual_rate_sick: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 1
      },
      accrual_rate_personal: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.5
      },
      max_vacation_balance: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 30
      },
      year: {
        type: Sequelize.INTEGER
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('leave_balances', ['employee_id']);
    await queryInterface.addIndex('leave_balances', ['year']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('leave_balances');
  }
};