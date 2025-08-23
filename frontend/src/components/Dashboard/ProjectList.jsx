import React, { useState } from 'react';
import api from '../../services/api';

const ProjectList = ({ projects, users, onProjectUpdated, onProjectDeleted }) => {
  const [editingProject, setEditingProject] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [assigningUsers, setAssigningUsers] = useState(null);
  const [userAssignment, setUserAssignment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fixed overdue task detection
  const hasOverdueTasks = (project) => {
    // New projects won't have tasks, so return false
    if (!project.tasks || project.tasks.length === 0) {
      return false;
    }
    
    // Check if any task is overdue and not done
    const today = new Date();
    return project.tasks.some(task => {
      const taskDeadline = new Date(task.deadline);
      return taskDeadline < today && task.status !== 'Done';
    });
  };

  const handleEdit = (project) => {
    setEditingProject(project._id);
    setEditTitle(project.title);
    setEditDescription(project.description);
  };

  const handleSave = async (projectId) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.put(`/projects/${projectId}`, {
        title: editTitle,
        description: editDescription
      });
      onProjectUpdated(response.data);
      setEditingProject(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update project');
    }
    setLoading(false);
  };

  const handleAssignUsers = (project) => {
    setAssigningUsers(project._id);
    setUserAssignment(project.assignedUsers.map(user => user._id));
  };

  const handleUserAssignment = async (projectId) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.put(`/projects/${projectId}/assign-users`, {
        userIds: userAssignment
      });
      onProjectUpdated(response.data);
      setAssigningUsers(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to assign users');
    }
    setLoading(false);
  };

  const handleUserSelection = (userId) => {
    if (userAssignment.includes(userId)) {
      setUserAssignment(userAssignment.filter(id => id !== userId));
    } else {
      setUserAssignment([...userAssignment, userId]);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all tasks associated with it.')) return;
    
    try {
      setLoading(true);
      setError('');
      await api.delete(`/projects/${projectId}`);
      onProjectDeleted(projectId);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete project');
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    setEditingProject(null);
    setEditTitle('');
    setEditDescription('');
  };

  const cancelAssignment = () => {
    setAssigningUsers(null);
    setUserAssignment([]);
  };

  return (
    <div>
      <h3>Projects</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        projects.map(project => (
          <div key={project._id} style={{ 
            padding: '15px', 
            border: '1px solid #ddd', 
            borderRadius: '5px', 
            marginBottom: '10px',
            backgroundColor: hasOverdueTasks(project) ? '#fff3f3' : 'white'
          }}>
            {editingProject === project._id ? (
              <div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ width: '100%', padding: '8px', minHeight: '80px', marginBottom: '10px' }}
                />
                <button onClick={() => handleSave(project._id)} disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button onClick={cancelEdit} disabled={loading} style={{ marginLeft: '10px' }}>
                  Cancel
                </button>
              </div>
            ) : assigningUsers === project._id ? (
              <div>
                <h4>Assign Users to {project.title}</h4>
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '5px', marginBottom: '10px' }}>
                  {users.map(user => (
                    <div key={user._id} style={{ marginBottom: '5px' }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={userAssignment.includes(user._id)}
                          onChange={() => handleUserSelection(user._id)}
                          style={{ marginRight: '5px' }}
                        />
                        {user.name} ({user.email})
                      </label>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleUserAssignment(project._id)} disabled={loading}>
                  {loading ? 'Assigning...' : 'Assign Users'}
                </button>
                <button onClick={cancelAssignment} disabled={loading} style={{ marginLeft: '10px' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>{project.title}</h4>
                  {hasOverdueTasks(project) && (
                    <span style={{ color: '#dc3545', fontWeight: 'bold' }}>Overdue Tasks</span>
                  )}
                </div>
                <p>{project.description}</p>
                <p>Created by: {project.createdBy.name}</p>
                <p>Assigned users: {project.assignedUsers.map(u => u.name).join(', ') || 'None'}</p>
                <button onClick={() => handleEdit(project)}>Edit</button>
                <button onClick={() => handleAssignUsers(project)} style={{ marginLeft: '10px' }}>
                  Assign Users
                </button>
                <button onClick={() => handleDelete(project._id)} style={{ marginLeft: '10px', backgroundColor: '#dc3545' }}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ProjectList;