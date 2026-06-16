const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs'); // Replace with 'bcrypt' if that's what you installed

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Hash the default admin password securely
    const hashedPassword = await bcrypt.hash('AdminSecure2026!', 10);

    // 2. Insert the Admin user into the "users" table
    return queryInterface.bulkInsert('users', [
      {
        id: uuidv4(), // Generates a clean UUIDv4 for your ID field
        full_name: 'System Administrator',
        email: 'admin@ems.com',
        password: hashedPassword,
        role: 'admin',
        is_active: true,
        created_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Allows you to undo the seed by deleting this specific user by email
    return queryInterface.bulkDelete('users', { email: 'admin@ems.com' }, {});
  }
};