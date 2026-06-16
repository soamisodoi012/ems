const Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * 1. Create departments table (Without manager foreign key constraint)
 * 2. Create employees table (Now safely references departments)
 * 3. Add manager_id foreign key constraint back to departments table
 * 4. Create users, attendances, and leaves tables
 * 5. Add compound unique index to attendances
 *
 */

const info = {
  revision: 1,
  name: "create-initial-tables",
  created: "2026-06-12T11:52:03.660Z",
  comment: "",
};

const migrationCommands = (transaction) => [
  // STEP 1: Create departments first (WITHOUT the employees reference constraint)
  {
    fn: "createTable",
    params: [
      "departments",
      {
        id: {
          type: Sequelize.UUID,
          field: "id",
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          type: Sequelize.STRING,
          field: "name",
          unique: true,
          allowNull: false,
        },
        description: { type: Sequelize.TEXT, field: "description" },
        manager_id: {
          type: Sequelize.UUID,
          field: "manager_id",
          allowNull: true, // Kept open initially to resolve circular lock
        },
        created_at: {
          type: Sequelize.DATE,
          field: "created_at",
          defaultValue: Sequelize.NOW,
        },
      },
      { transaction },
    ],
  },
  // STEP 2: Create employees table (Can now safely reference departments)
  {
    fn: "createTable",
    params: [
      "employees",
      {
        id: {
          type: Sequelize.UUID,
          field: "id",
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        department_id: {
          type: Sequelize.UUID,
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          allowNull: true,
          field: "department_id",
          references: { model: "departments", key: "id" },
        },
        full_name: {
          type: Sequelize.STRING,
          field: "full_name",
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          field: "email",
          unique: true,
          allowNull: false,
        },
        phone: { type: Sequelize.STRING, field: "phone" },
        position: {
          type: Sequelize.STRING,
          field: "position",
          allowNull: false,
        },
        salary: { type: Sequelize.DECIMAL(10, 2), field: "salary" },
        employment_date: {
          type: Sequelize.DATEONLY,
          field: "employment_date",
          defaultValue: Sequelize.NOW,
        },
        manager_id: {
          type: Sequelize.UUID,
          onUpdate: "CASCADE",
          onDelete: "NO ACTION",
          allowNull: true,
          field: "manager_id",
          references: { model: "employees", key: "id" }, // Self reference is safe here
        },
        status: {
          type: Sequelize.ENUM("active", "inactive", "on_leave", "terminated"),
          field: "status",
          defaultValue: "active",
        },
        employee_code: {
          type: Sequelize.STRING,
          field: "employee_code",
          unique: true,
        },
        created_at: {
          type: Sequelize.DATE,
          field: "created_at",
          defaultValue: Sequelize.NOW,
        },
      },
      { transaction },
    ],
  },
  // STEP 3: Add the missing Foreign Key Constraint onto departments now that employees exists
  {
    fn: "addConstraint",
    params: [
      "departments",
      {
        fields: ["manager_id"],
        type: "foreign key",
        name: "departments_manager_id_fkey",
        references: {
          table: "employees",
          field: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        transaction,
      },
    ],
  },
  // STEP 4: Create users table
  {
    fn: "createTable",
    params: [
      "users",
      {
        id: {
          type: Sequelize.UUID,
          field: "id",
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        full_name: {
          type: Sequelize.STRING,
          field: "full_name",
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          field: "email",
          unique: true,
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING,
          field: "password",
          allowNull: false,
        },
        role: {
          type: Sequelize.ENUM("admin", "manager", "employee"),
          field: "role",
          defaultValue: "employee",
        },
        employee_id: {
          type: Sequelize.UUID,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: true,
          field: "employee_id",
          references: { model: "employees", key: "id" },
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          field: "is_active",
          defaultValue: true,
        },
        created_at: {
          type: Sequelize.DATE,
          field: "created_at",
          defaultValue: Sequelize.NOW,
        },
      },
      { transaction },
    ],
  },
  // STEP 5: Create attendances table
  {
    fn: "createTable",
    params: [
      "attendances",
      {
        id: {
          type: Sequelize.UUID,
          field: "id",
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        employee_id: {
          type: Sequelize.UUID,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          field: "employee_id",
          references: { model: "employees", key: "id" },
          allowNull: false,
        },
        date: { type: Sequelize.DATEONLY, field: "date", allowNull: false },
        check_in: { type: Sequelize.DATE, field: "check_in" },
        check_out: { type: Sequelize.DATE, field: "check_out" },
        status: {
          type: Sequelize.ENUM("present", "absent", "late", "half_day"),
          field: "status",
          defaultValue: "present",
        },
        working_hours: {
          type: Sequelize.FLOAT,
          field: "working_hours",
          defaultValue: 0,
        },
        overtime: { type: Sequelize.FLOAT, field: "overtime", defaultValue: 0 },
        notes: { type: Sequelize.TEXT, field: "notes" },
        created_at: {
          type: Sequelize.DATE,
          field: "created_at",
          defaultValue: Sequelize.NOW,
        },
      },
      { transaction },
    ],
  },
  // STEP 6: Create leaves table
  {
    fn: "createTable",
    params: [
      "leaves",
      {
        id: {
          type: Sequelize.UUID,
          field: "id",
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        employee_id: {
          type: Sequelize.UUID,
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          field: "employee_id",
          references: { model: "employees", key: "id" },
          allowNull: false,
        },
        leave_type: {
          type: Sequelize.ENUM(
            "sick",
            "vacation",
            "personal",
            "unpaid",
            "maternity",
            "paternity",
            "bereavement"
          ),
          field: "leave_type",
          allowNull: false,
        },
        start_date: {
          type: Sequelize.DATEONLY,
          field: "start_date",
          allowNull: false,
        },
        end_date: {
          type: Sequelize.DATEONLY,
          field: "end_date",
          allowNull: false,
        },
        total_days: {
          type: Sequelize.INTEGER,
          field: "total_days",
          allowNull: false,
        },
        reason: { type: Sequelize.TEXT, field: "reason", allowNull: false },
        status: {
          type: Sequelize.ENUM("pending", "approved", "rejected", "cancelled"),
          field: "status",
          defaultValue: "pending",
        },
        approved_by: {
          type: Sequelize.UUID,
          field: "approved_by",
          references: { model: "employees", key: "id" },
        },
        approved_date: { type: Sequelize.DATE, field: "approved_date" },
        rejection_reason: { type: Sequelize.TEXT, field: "rejection_reason" },
        attachment_url: { type: Sequelize.STRING, field: "attachment_url" },
        created_at: {
          type: Sequelize.DATE,
          field: "created_at",
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          field: "updated_at",
          defaultValue: Sequelize.NOW,
        },
      },
      { transaction },
    ],
  },
  // STEP 7: Apply the unique constraints index
  {
    fn: "addIndex",
    params: [
      "attendances",
      ["employee_id", "date"],
      {
        indexName: "attendances_employee_id_date",
        name: "attendances_employee_id_date",
        indicesType: "UNIQUE",
        type: "UNIQUE",
        transaction,
      },
    ],
  },
];

const rollbackCommands = (transaction) => [
  {
    fn: "dropTable",
    params: ["users", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["leaves", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["attendances", { transaction }],
  },
  {
    fn: "removeConstraint",
    params: ["departments", "departments_manager_id_fkey", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["employees", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["departments", { transaction }],
  },
];

const pos = 0;
const useTransaction = true;

const execute = (queryInterface, sequelize, _commands) => {
  let index = pos;
  const run = (transaction) => {
    const commands = _commands(transaction);
    return new Promise((resolve, reject) => {
      const next = () => {
        if (index < commands.length) {
          const command = commands[index];
          console.log(`[#${index}] execute: ${command.fn}`);
          index++;
          queryInterface[command.fn](...command.params).then(next, reject);
        } else resolve();
      };
      next();
    });
  };
  if (useTransaction) return queryInterface.sequelize.transaction(run);
  return run(null);
};

module.exports = {
  pos,
  useTransaction,
  up: (queryInterface, sequelize) =>
    execute(queryInterface, sequelize, migrationCommands),
  down: (queryInterface, sequelize) =>
    execute(queryInterface, sequelize, rollbackCommands),
  info,
};