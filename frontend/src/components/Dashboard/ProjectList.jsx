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

  const hasOverdueTasks = (project) => {
    if (!project.tasks || project.tasks.length === 0) {
      return false;
    }
    
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
      <h3 className="text-lg font-medium text-gray-900 mb-4">Projects</h3>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
      {projects.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No projects found</div>
          <p className="text-gray-500">Create your first project to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <div key={project._id} className={`bg-white p-4 rounded-lg shadow-sm border ${hasOverdueTasks(project) ? 'border-red-300' : 'border-gray-200'}`}>
              {editingProject === project._id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave(project._id)}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : assigningUsers === project._id ? (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Assign Users to {project.title}</h4>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {users.map(user => (
                      <div key={user._id} className="flex items-center mb-2 last:mb-0">
                        <input
                          type="checkbox"
                          id={`assign-user-${user._id}`}
                          checked={userAssignment.includes(user._id)}
                          onChange={() => handleUserSelection(user._id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`assign-user-${user._id}`} className="ml-2 block text-sm text-gray-700">
                          {user.name} ({user.email})
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUserAssignment(project._id)}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {loading ? 'Assigning...' : 'Assign Users'}
                    </button>
                    <button
                      onClick={cancelAssignment}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                    {hasOverdueTasks(project) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Overdue Tasks
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{project.description}</p>
                  <div className="text-sm text-gray-500 mb-3">
                    <p>Created by: {project.createdBy.name}</p>
                    <p>Assigned users: {project.assignedUsers.map(u => u.name).join(', ') || 'None'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleAssignUsers(project)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Assign Users
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;