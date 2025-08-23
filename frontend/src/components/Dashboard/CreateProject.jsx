import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CreateProject = ({ onProjectCreated, users }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/projects', { 
        title, 
        description, 
        assignedUsers 
      });
      onProjectCreated(response.data);
      setTitle('');
      setDescription('');
      setAssignedUsers([]);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create project');
    }
    setLoading(false);
  };

  const handleUserSelection = (userId) => {
    if (assignedUsers.includes(userId)) {
      setAssignedUsers(assignedUsers.filter(id => id !== userId));
    } else {
      setAssignedUsers([...assignedUsers, userId]);
    }
  };

  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h3>Create New Project</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            placeholder="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', minHeight: '80px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Assign Users:</label>
          <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '5px' }}>
            {users.map(user => (
              <div key={user._id} style={{ marginBottom: '5px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={assignedUsers.includes(user._id)}
                    onChange={() => handleUserSelection(user._id)}
                    style={{ marginRight: '5px' }}
                  />
                  {user.name} ({user.email})
                </label>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
};

export default CreateProject;