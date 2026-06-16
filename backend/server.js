const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const errorMiddleware = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const userRoutes = require('./routes/userRoutes'); // Add this line


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/users', userRoutes); 
// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use(errorMiddleware);

app.use(errorMiddleware);

// ============= ADD THIS STARTUP BLOCK =============
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Authenticate the Postgres database connection
    await sequelize.authenticate();
    console.log('🚀 Database connected successfully via Migrations.');

    // Start listening for incoming API requests
    app.listen(PORT, () => {
      console.log(`Server is live and running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1); // Drop the process if it can't reach Postgres
  }
}

startServer();
// ==================================================

module.exports = app;