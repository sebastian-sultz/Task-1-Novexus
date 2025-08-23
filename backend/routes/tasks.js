const express = require('express');
const { createTask, getTasks, getTask, updateTask, submitTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

// Add submit route
router.put('/:id/submit', protect, submitTask);

module.exports = router;