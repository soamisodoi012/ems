const express = require('express');
const employeeController = require('../controllers/employeeController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(restrictTo('admin', 'manager'), employeeController.getAllEmployees)
  .post(restrictTo('admin'), employeeController.createEmployee);

router.route('/:id')
  .get(employeeController.getEmployee)
  .patch(restrictTo('admin', 'manager'), employeeController.updateEmployee)
  .delete(restrictTo('admin'), employeeController.deleteEmployee);

module.exports = router;