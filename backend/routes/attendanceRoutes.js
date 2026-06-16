/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management endpoints
 */

const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All attendance routes require authentication
router.use(protect);

/**
 * @swagger
 * /attendance/check-in:
 *   post:
 *     summary: Check in for attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee_id:
 *                 type: string
 *                 format: uuid
 *                 description: Employee ID (Admin/Manager only, optional for employees)
 *               notes:
 *                 type: string
 *                 description: Additional notes about check-in
 *                 example: Working from office
 *     responses:
 *       200:
 *         description: Check-in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Successfully checked in
 *                 data:
 *                   type: object
 *                   properties:
 *                     attendance:
 *                       $ref: '#/components/schemas/Attendance'
 *                     check_in_time:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       enum: [present, late]
 *                       example: present
 *       400:
 *         description: Already checked in today
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot check in for others
 *       404:
 *         description: Employee not found
 */
router.post('/check-in', attendanceController.checkIn);

/**
 * @swagger
 * /attendance/check-out:
 *   post:
 *     summary: Check out from attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee_id:
 *                 type: string
 *                 format: uuid
 *                 description: Employee ID (Admin/Manager only, optional for employees)
 *               notes:
 *                 type: string
 *                 description: Additional notes about check-out
 *                 example: Finished work for the day
 *     responses:
 *       200:
 *         description: Check-out successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Successfully checked out
 *                 data:
 *                   type: object
 *                   properties:
 *                     attendance:
 *                       $ref: '#/components/schemas/Attendance'
 *                     check_out_time:
 *                       type: string
 *                       format: date-time
 *                     working_hours:
 *                       type: number
 *                       format: float
 *                       example: 8.5
 *                     overtime:
 *                       type: number
 *                       format: float
 *                       example: 0.5
 *       400:
 *         description: No check-in found or already checked out
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot check out for others
 *       404:
 *         description: Employee not found
 */
router.post('/check-out', attendanceController.checkOut);

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: Get attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by employee ID (Admin/Manager only)
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date
 *         example: 2024-01-15
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for date range filter
 *         example: 2024-01-01
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for date range filter
 *         example: 2024-01-31
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [present, absent, late, half_day]
 *         description: Filter by attendance status
 *     responses:
 *       200:
 *         description: List of attendance records
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
 *                     $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot view others' attendance
 */
router.get('/', attendanceController.getAttendance);

module.exports = router;