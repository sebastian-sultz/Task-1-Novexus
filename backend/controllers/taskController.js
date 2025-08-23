// Add this function to handle task reopening by admin
const reopenTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Only admin can reopen tasks
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to reopen tasks' });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status: 'In Progress' },
      { new: true, runValidators: true }
    )
    .populate('projectId', 'title')
    .populate('assignedUserId', 'name email');
    
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to exports
module.exports = { createTask, getTasks, getTask, updateTask, submitTask, deleteTask, reopenTask };