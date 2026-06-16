const express = require('express');
const leaveController = require('../controllers/leaveController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Leave application and management
router.post('/apply', leaveController.applyLeave);
router.get('/', leaveController.getLeaves);
router.get('/balance/:employee_id', leaveController.getLeaveBalance);
router.get('/:id', leaveController.getLeaveById);
router.patch('/:id/approve', restrictTo('admin', 'manager'), leaveController.approveLeave);
router.patch('/:id/cancel', leaveController.cancelLeave);

// Admin only routes
router.post('/manual-accrual', restrictTo('admin'), leaveController.manualAccrual);
router.post('/run-monthly-accrual', restrictTo('admin'), leaveController.runMonthlyAccrual);

module.exports = router;