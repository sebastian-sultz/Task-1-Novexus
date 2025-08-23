const express = require('express');
const { 
  createProject, 
  getProjects, 
  getProject, 
  updateProject, 
  assignUsersToProject,
  deleteProject 
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

// Add assign users route
router.put('/:id/assign-users', protect, assignUsersToProject);

// Add this route for deleting all tasks associated with a project
router.delete('/:id/tasks', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is admin or the creator of the project
    if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete tasks for this project' });
    }
    
    // Delete all tasks associated with this project
    await Task.deleteMany({ projectId: req.params.id });
    
    res.status(200).json({ message: 'All project tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;