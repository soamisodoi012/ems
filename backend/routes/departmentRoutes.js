const express = require('express');
const departmentController = require('../controllers/departmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(departmentController.getAllDepartments)
  .post(restrictTo('admin'), departmentController.createDepartment);

router.route('/:id')
  .get(restrictTo('admin', 'manager'), departmentController.getDepartment)
  .patch(restrictTo('admin'), departmentController.updateDepartment)
  .delete(restrictTo('admin'), departmentController.deleteDepartment);

module.exports = router;