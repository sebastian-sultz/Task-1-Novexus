import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ReopenTaskModal from './ReopenTaskModal';

const TaskByUserView = ({ tasks, onTaskUpdated, onTaskDeleted }) => {
  const { user } = useAuth();
  const [expandedUsers, setExpandedUsers] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);

  // Group tasks by user
  const tasksByUser = tasks.reduce((groups, task) => {
    if (!task.assignedUserId) return groups;
    
    const userId = task.assignedUserId._id;
    if (!groups[userId]) {
      groups[userId] = {
        user: task.assignedUserId,
        tasks: []
      };
    }
    groups[userId].tasks.push(task);
    return groups;
  }, {});

  // Filter tasks by status if needed
  const filteredTasksByUser = Object.keys(tasksByUser).reduce((groups, userId) => {
    const userGroup = tasksByUser[userId];
    const filteredTasks = statusFilter === 'all' 
      ? userGroup.tasks 
      : userGroup.tasks.filter(task => task.status === statusFilter);
    
    if (filteredTasks.length > 0) {
      groups[userId] = {
        user: userGroup.user,
        tasks: filteredTasks
      };
    }
    
    return groups;
  }, {});

  const toggleUserExpansion = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setLoading(true);
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      onTaskUpdated(response.data);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
    setLoading(false);
  };

  const handleReopenTask = (task) => {
    setSelectedTask(task);
    setReopenModalOpen(true);
  };

  const handleReopenConfirm = async (newDeadline) => {
    try {
      setLoading(true);
      const response = await api.put(`/tasks/${selectedTask._id}/reopen`, {
        deadline: newDeadline
      });
      onTaskUpdated(response.data);
      setReopenModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to reopen task:', error);
    }
    setLoading(false);
  };

  // Expand all users when filtered
  React.useEffect(() => {
    if (statusFilter !== 'all') {
      const expanded = {};
      Object.keys(filteredTasksByUser).forEach(userId => {
        expanded[userId] = true;
      });
      setExpandedUsers(expanded);
    }
  }, [statusFilter, filteredTasksByUser]);

  return (
    <div className="task-by-user-view">
      <div className="view-controls">
        <div className="filter-group">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select 
            id="statusFilter"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        
        <div className="result-count">
          Showing {Object.keys(filteredTasksByUser).length} users with tasks
        </div>
      </div>

      {Object.keys(filteredTasksByUser).length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No tasks found</h3>
          <p>There are no tasks matching your filter criteria.</p>
          <button 
            onClick={() => setStatusFilter('all')}
            className="btn btn-primary"
          >
            Clear Filter
          </button>
        </div>
      ) : (
        <div className="user-cards-container">
          {Object.values(filteredTasksByUser).map(({ user: userData, tasks: userTasks }) => (
            <div key={userData._id} className="user-task-card">
              <div 
                className="user-header"
                onClick={() => toggleUserExpansion(userData._id)}
              >
                <div className="user-info">
                  <div className="user-avatar">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <h3 className="user-name">{userData.name}</h3>
                    <p className="user-email">{userData.email}</p>
                    <div className="user-stats">
                      <span className="task-count">
                        {userTasks.length} task{userTasks.length !== 1 ? 's' : ''}
                        {statusFilter !== 'all' && ` (${statusFilter})`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="user-actions">
                  <span className={`expand-icon ${expandedUsers[userData._id] ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              {expandedUsers[userData._id] && (
                <div className="user-tasks-list">
                  {userTasks.map(task => (
                    <div key={task._id} className={`task-item ${task.status.toLowerCase().replace(' ', '-')}`}>
                      <div className="task-main">
                        <h4 className="task-title">{task.title}</h4>
                        <p className="task-description">{task.description}</p>
                        <div className="task-meta">
                          <span className="task-project">
                            Project: {task.projectId?.title || 'Unassigned'}
                          </span>
                          <span className="task-deadline">
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </span>
                          <span className={`status-indicator status-${task.status.toLowerCase().replace(' ', '-')}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                      <div className="task-actions">
                        {/* Only show status dropdown to the assigned user */}
                        {user._id === task.assignedUserId._id && (
                          <select 
                            value={task.status} 
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className="status-select"
                            disabled={loading}
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                          </select>
                        )}
                        
                        {/* Show reopen button to admins for completed tasks */}
                        {user.role === 'admin' && task.status === 'Done' && (
                          <button 
                            onClick={() => handleReopenTask(task)}
                            disabled={loading}
                            className="btn btn-warning btn-sm"
                          >
                            Reopen
                          </button>
                        )}
                        
                        {user.role === 'admin' && (
                          <button 
                            onClick={() => onTaskDeleted(task._id)}
                            disabled={loading}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <ReopenTaskModal 
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        onConfirm={handleReopenConfirm}
        task={selectedTask}
        loading={loading}
      />
    </div>
  );
};

export default TaskByUserView;