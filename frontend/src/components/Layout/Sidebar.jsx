import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div style={{ width: '200px', padding: '20px', backgroundColor: '#f0f0f0', height: '100vh' }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {user && user.role === 'admin' && (
          <>
            <li><Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link></li>
            <li><Link to="/projects" className={isActive('/projects')}>Projects</Link></li>
            <li><Link to="/tasks" className={isActive('/tasks')}>Tasks</Link></li>
            <li><Link to="/users" className={isActive('/users')}>Users</Link></li>
          </>
        )}
        {user && user.role === 'user' && (
          <li><Link to="/dashboard" className={isActive('/dashboard')}>My Tasks</Link></li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;