/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department management endpoints
 */

const express = require('express');
const departmentController = require('../controllers/departmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All department routes require authentication
router.use(protect);

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all departments
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
 *                     departments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Department'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Department name
 *                 example: Engineering
 *               description:
 *                 type: string
 *                 description: Department description
 *                 example: Handles all software development and engineering projects
 *               manager_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the department manager (optional)
 *                 example: 550e8400-e29b-41d4-a716-446655440001
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       400:
 *         description: Validation error or duplicate department name
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
  .get(departmentController.getAllDepartments)
  .post(restrictTo('admin'), departmentController.createDepartment);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department details with employees and manager
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 *   
 *   patch:
 *     summary: Update department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Department name
 *                 example: Engineering
 *               description:
 *                 type: string
 *                 description: Department description
 *                 example: Handles all software development and engineering projects
 *               manager_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the department manager (set to null to remove)
 *                 example: 550e8400-e29b-41d4-a716-446655440001
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       404:
 *         description: Department not found
 *       400:
 *         description: Validation error or duplicate department name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *   
 *   delete:
 *     summary: Delete department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       204:
 *         description: Department deleted successfully
 *       400:
 *         description: Cannot delete department with existing employees
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Department not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.route('/:id')
  .get(restrictTo('admin', 'manager'), departmentController.getDepartment)
  .patch(restrictTo('admin'), departmentController.updateDepartment)
  .delete(restrictTo('admin'), departmentController.deleteDepartment);

module.exports = router;