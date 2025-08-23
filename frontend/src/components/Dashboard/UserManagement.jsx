import React, { useState } from 'react';
import api from '../../services/api';
import Modal from '../Common/Modal';

const UserManagement = ({ users, onUserCreated, onUserDeleted }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/auth/register', { 
        name, 
        email, 
        password, 
        role 
      });
      
      if (response.data) {
        onUserCreated(response.data);
        setName('');
        setEmail('');
        setPassword('');
        setRole('user');
        setShowCreateModal(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create user');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    
    try {
      setLoading(true);
      setError('');
      await api.delete(`/users/${userId}`);
      onUserDeleted(userId);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete user');
    }
    setLoading(false);
  };

  const openCreateModal = () => {
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  return (
    <div className="user-management">
      <div className="section-header">
        <h3>User Management</h3>
        <button className="btn-primary" onClick={openCreateModal}>
          + Add New User
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Modal 
        isOpen={showCreateModal} 
        onClose={closeCreateModal}
        title="Create New User"
      >
        <form onSubmit={handleCreateUser} className="user-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select 
              id="role"
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={closeCreateModal}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="users-list">
        <h4>All Users ({users.length})</h4>
        {users.length === 0 ? (
          <p className="no-data">No users found.</p>
        ) : (
          <div className="user-cards">
            {users.map(user => (
              <div key={user._id} className="user-card">
                <div className="user-info">
                  <h5>{user.name}</h5>
                  <p className="user-email">{user.email}</p>
                  <span className={`user-role ${user.role}`}>{user.role}</span>
                </div>
                <div className="user-actions">
                  <button 
                    onClick={() => handleDeleteUser(user._id, user.name)} 
                    disabled={loading}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;