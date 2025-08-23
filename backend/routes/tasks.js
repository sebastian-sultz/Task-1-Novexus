const express = require('express');
const { createTask, getTasks, getTask, updateTask, submitTask, deleteTask, reopenTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

// Add submit and reopen routes
router.put('/:id/submit', protect, submitTask);
router.put('/:id/reopen', protect, reopenTask);

module.exports = router;