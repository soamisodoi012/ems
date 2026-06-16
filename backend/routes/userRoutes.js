const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All user routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.post('/employee/:employee_id', userController.createUserForEmployee);

module.exports = router;