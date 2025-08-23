const Task = require('../models/Task');

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, status, deadline, projectId, assignedUserId } = req.body;
    
    const task = await Task.create({
      title,
      description,
      status: status || 'To Do',
      deadline,
      projectId,
      assignedUserId
    });
    
    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'title')
      .populate('assignedUserId', 'name email');
    
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tasks (admin sees all, users see only assigned tasks)
const getTasks = async (req, res) => {
  try {
    let tasks;
    
    if (req.user.role === 'admin') {
      tasks = await Task.find()
        .populate('projectId', 'title')
        .populate('assignedUserId', 'name email');
    } else {
      tasks = await Task.find({ assignedUserId: req.user._id })
        .populate('projectId', 'title')
        .populate('assignedUserId', 'name email');
    }
    
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single task
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('projectId', 'title')
      .populate('assignedUserId', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user is admin or assigned to the task
    if (req.user.role !== 'admin' && task.assignedUserId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }
    
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user is admin or the assigned user
    if (req.user.role !== 'admin' && task.assignedUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }
    
    // If user is not admin, only allow status updates
    let updateData = req.body;
    if (req.user.role !== 'admin') {
      updateData = { status: req.body.status };
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('projectId', 'title')
    .populate('assignedUserId', 'name email');
    
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit a task (mark as done)
const submitTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user is the assigned user
    if (task.assignedUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit this task' });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status: 'Done' },
      { new: true, runValidators: true }
    )
    .populate('projectId', 'title')
    .populate('assignedUserId', 'name email');
    
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Only admin can delete tasks
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete tasks' });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, submitTask, deleteTask };