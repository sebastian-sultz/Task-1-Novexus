import React, { useState } from 'react';
import api from '../../services/api';
import Card from '../Common/Card';
import Button from '../Common/Button';
import StarBorder from '../Common/StarBorder';

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
    <Card>
      <Card.Header>
        <Card.Title>Create New Project</Card.Title>
      </Card.Header>
      <Card.Body>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Project Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Project Description
            </label>
            <textarea
              id="description"
              placeholder="Project Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Users
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
              {users.map(user => (
                <div key={user._id} className="flex items-center mb-2 last:mb-0">
                  <input
                    type="checkbox"
                    id={`user-${user._id}`}
                    checked={assignedUsers.includes(user._id)}
                    onChange={() => handleUserSelection(user._id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`user-${user._id}`} className="ml-2 block text-sm text-gray-700">
                    {user.name} ({user.email})
                  </label>
                </div>
              ))}
            </div>
          </div>
          <StarBorder as='button'
            type="submit"
            loading={loading}
           className='w-full'
          >
            Create Project
          </StarBorder>
        </form>
      </Card.Body>
    </Card>
  );
};

export default CreateProject;