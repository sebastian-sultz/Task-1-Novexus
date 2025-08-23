const Project = require('../models/Project');
const Task = require('../models/Task');


// Create a new project
const createProject = async (req, res) => {
  try {
    const { title, description, assignedUsers } = req.body;
    
    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      assignedUsers: assignedUsers || []
    });
    
    // Populate the assigned users for the response
    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('assignedUsers', 'name email');
    
    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all projects (admin sees all, users see only assigned projects)
// In the getProjects function, ensure users only see their assigned projects
// Get all projects (admin sees all, users see only assigned projects)
const getProjects = async (req, res) => {
  try {
    let projects;
    
    if (req.user.role === 'admin') {
      projects = await Project.find()
        .populate('createdBy', 'name email')
        .populate('assignedUsers', 'name email');
    } else {
      projects = await Project.find({ 
        assignedUsers: req.user._id  // Only projects where user is assigned
      })
      .populate('createdBy', 'name email')
      .populate('assignedUsers', 'name email');
    }
    
    // Get tasks for each project
    const projectsWithTasks = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ projectId: project._id })
        .populate('projectId', 'title')
        .populate('assignedUserId', 'name email');
      
      return {
        ...project.toObject(),
        tasks
      };
    }));
    
    res.status(200).json(projectsWithTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single project
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedUsers', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is admin or assigned to the project
    if (req.user.role !== 'admin' && 
        project.createdBy._id.toString() !== req.user._id.toString() &&
        !project.assignedUsers.some(user => user._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }
    
    // Get tasks for this project
    const tasks = await Task.find({ projectId: project._id })
      .populate('projectId', 'title')
      .populate('assignedUserId', 'name email');
    
    const projectWithTasks = {
      ...project.toObject(),
      tasks
    };
    
    res.status(200).json(projectWithTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a project (including user assignment)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is admin or the creator of the project
    if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('assignedUsers', 'name email');
    
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign users to a project
const assignUsersToProject = async (req, res) => {
  try {
    const { userIds } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is admin or the creator of the project
    if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    // Add users to the project (avoid duplicates)
    const uniqueUserIds = [...new Set([...project.assignedUsers.map(id => id.toString()), ...userIds])];
    project.assignedUsers = uniqueUserIds;
    
    await project.save();
    
    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('assignedUsers', 'name email');
    
    res.status(200).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a project
// Delete a project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Only admin or creator can delete
    if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }
    
    // Delete all tasks associated with this project first
    await Task.deleteMany({ projectId: req.params.id });
    
    // Then delete the project
    await Project.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Project and all associated tasks removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createProject, 
  getProjects, 
  getProject, 
  updateProject, 
  assignUsersToProject,
  deleteProject 
};