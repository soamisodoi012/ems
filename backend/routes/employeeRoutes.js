/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management endpoints
 */

const express = require('express');
const employeeController = require('../controllers/employeeController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All employee routes require authentication
router.use(protect);

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by department ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, on_leave, terminated]
 *         description: Filter by employee status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or position
 *     responses:
 *       200:
 *         description: List of employees with pagination
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
 *                     employees:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Employee'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - position
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Employee's full name
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Employee's email address
 *                 example: john.doe@company.com
 *               phone:
 *                 type: string
 *                 description: Employee's phone number
 *                 example: +1234567890
 *               position:
 *                 type: string
 *                 description: Job position
 *                 example: Senior Developer
 *               salary:
 *                 type: number
 *                 format: decimal
 *                 description: Monthly salary
 *                 example: 75000.00
 *               employment_date:
 *                 type: string
 *                 format: date
 *                 description: Date of employment
 *                 example: 2024-01-15
 *               department_id:
 *                 type: string
 *                 format: uuid
 *                 description: Department ID
 *               status:
 *                 type: string
 *                 enum: [active, inactive, on_leave, terminated]
 *                 default: active
 *                 description: Employee status
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Validation error or duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.route('/')
  .get(restrictTo('admin', 'manager'), employeeController.getAllEmployees)
  .post(restrictTo('admin'), employeeController.createEmployee);

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *   
 *   patch:
 *     summary: Update employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Employee's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Employee's email address
 *               phone:
 *                 type: string
 *                 description: Employee's phone number
 *               position:
 *                 type: string
 *                 description: Job position
 *               salary:
 *                 type: number
 *                 format: decimal
 *                 description: Monthly salary
 *               department_id:
 *                 type: string
 *                 format: uuid
 *                 description: Department ID
 *               status:
 *                 type: string
 *                 enum: [active, inactive, on_leave, terminated]
 *                 description: Employee status
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *   
 *   delete:
 *     summary: Delete employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       204:
 *         description: Employee deleted successfully
 *       400:
 *         description: Cannot delete employee with associated user account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.route('/:id')
  .get(employeeController.getEmployee)
  .patch(restrictTo('admin', 'manager'), employeeController.updateEmployee)
  .delete(restrictTo('admin'), employeeController.deleteEmployee);

module.exports = router;