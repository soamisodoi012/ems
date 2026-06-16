/**
 * @swagger
 * tags:
 *   name: Leaves
 *   description: Leave management endpoints
 */

const express = require('express');
const leaveController = require('../controllers/leaveController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /leaves/apply:
 *   post:
 *     summary: Apply for leave
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leave_type
 *               - start_date
 *               - end_date
 *               - reason
 *             properties:
 *               leave_type:
 *                 type: string
 *                 enum: [sick, vacation, personal, unpaid, maternity, paternity, bereavement]
 *                 description: Type of leave
 *                 example: vacation
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Start date of leave
 *                 example: 2024-01-15
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: End date of leave
 *                 example: 2024-01-20
 *               total_days:
 *                 type: integer
 *                 description: Total days (automatically calculated if not provided)
 *                 example: 5
 *               reason:
 *                 type: string
 *                 description: Reason for leave
 *                 example: Family vacation
 *               attachment_url:
 *                 type: string
 *                 description: URL to supporting document (optional)
 *     responses:
 *       201:
 *         description: Leave request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Leave'
 *       400:
 *         description: Invalid leave request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/apply', leaveController.applyLeave);

/**
 * @swagger
 * /leaves:
 *   get:
 *     summary: Get all leaves
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *         description: Filter by leave status
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by employee ID
 *       - in: query
 *         name: leave_type
 *         schema:
 *           type: string
 *           enum: [sick, vacation, personal, unpaid, maternity, paternity, bereavement]
 *         description: Filter by leave type
 *     responses:
 *       200:
 *         description: List of leave requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Leave'
 *       401:
 *         description: Unauthorized
 */
router.get('/', leaveController.getLeaves);

/**
 * @swagger
 * /leaves/balance/{employee_id}:
 *   get:
 *     summary: Get leave balance for an employee
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Leave balance details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     vacation_balance:
 *                       type: number
 *                       example: 15.5
 *                     sick_balance:
 *                       type: number
 *                       example: 10
 *                     personal_balance:
 *                       type: number
 *                       example: 3
 *                     vacation_used:
 *                       type: number
 *                       example: 5
 *                     sick_used:
 *                       type: number
 *                       example: 2
 *                     personal_used:
 *                       type: number
 *                       example: 1
 *                     last_accrual_date:
 *                       type: string
 *                       format: date
 *                     next_accrual_date:
 *                       type: string
 *                       format: date
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee not found
 */
router.get('/balance/:employee_id', leaveController.getLeaveBalance);

/**
 * @swagger
 * /leaves/{id}:
 *   get:
 *     summary: Get leave request by ID
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave request ID
 *     responses:
 *       200:
 *         description: Leave request details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Leave'
 *       404:
 *         description: Leave request not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/:id', leaveController.getLeaveById);

/**
 * @swagger
 * /leaves/{id}/approve:
 *   patch:
 *     summary: Approve a leave request (Admin/Manager only)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave request ID
 *     responses:
 *       200:
 *         description: Leave approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Leave'
 *       404:
 *         description: Leave request not found
 *       400:
 *         description: Leave already processed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 */
router.patch('/:id/approve', restrictTo('admin', 'manager'), leaveController.approveLeave);

/**
 * @swagger
 * /leaves/{id}/cancel:
 *   patch:
 *     summary: Cancel a leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave request ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejection_reason:
 *                 type: string
 *                 description: Reason for cancellation/rejection
 *                 example: Insufficient leave balance
 *     responses:
 *       200:
 *         description: Leave cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Leave'
 *       404:
 *         description: Leave request not found
 *       400:
 *         description: Leave already processed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch('/:id/cancel', leaveController.cancelLeave);

/**
 * @swagger
 * /leaves/manual-accrual:
 *   post:
 *     summary: Manually accrue leaves for an employee (Admin only)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - leave_type
 *               - days
 *             properties:
 *               employee_id:
 *                 type: string
 *                 format: uuid
 *                 description: Employee ID
 *               leave_type:
 *                 type: string
 *                 enum: [vacation, sick, personal]
 *                 description: Type of leave to accrue
 *               days:
 *                 type: number
 *                 description: Number of days to accrue
 *                 example: 1.5
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: Leave accrued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     balance:
 *                       type: object
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Employee not found
 */
router.post('/manual-accrual', restrictTo('admin'), leaveController.manualAccrual);

/**
 * @swagger
 * /leaves/run-monthly-accrual:
 *   post:
 *     summary: Run monthly leave accrual for all employees (Admin only)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly accrual completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     processed:
 *                       type: integer
 *                     skipped:
 *                       type: integer
 *                     errors:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/run-monthly-accrual', restrictTo('admin'), leaveController.runMonthlyAccrual);

module.exports = router;