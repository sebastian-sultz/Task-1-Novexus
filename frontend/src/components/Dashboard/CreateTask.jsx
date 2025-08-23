import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CreateTask = ({ projects, users, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0]._id);
    }
  }, [projects, projectId]);

  useEffect(() => {
    if (users.length > 0 && !assignedUserId) {
      setAssignedUserId(users[0]._id);
    }
  }, [users, assignedUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate deadline
    if (new Date(deadline) < new Date()) {
      setError('Deadline cannot be in the past');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/tasks', { 
        title, 
        description, 
        deadline,
        projectId,
        assignedUserId
      });
      onTaskCreated(response.data);
      setTitle('');
      setDescription('');
      setDeadline('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create task');
    }
    setLoading(false);
  };

  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h3>Create New Task</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', minHeight: '80px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Deadline: </label>
          <input
            type="date"
            value={deadline}
            min={today}
            onChange={(e) => setDeadline(e.target.value)}
            required
            style={{ padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Project: </label>
          <select 
            value={projectId} 
            onChange={(e) => setProjectId(e.target.value)}
            style={{ padding: '8px' }}
          >
            {projects.map(project => (
              <option key={project._id} value={project._id}>{project.title}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Assign to: </label>
          <select 
            value={assignedUserId} 
            onChange={(e) => setAssignedUserId(e.target.value)}
            style={{ padding: '8px' }}
          >
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
};

export default CreateTask;