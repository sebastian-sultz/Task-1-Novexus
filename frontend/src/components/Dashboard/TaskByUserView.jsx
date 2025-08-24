import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ReopenTaskModal from './ReopenTaskModal';
import Card from '../Common/Card';
import Button from '../Common/Button';

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

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select 
            id="statusFilter"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-500">
          Showing {Object.keys(filteredTasksByUser).length} users with tasks
        </div>
      </div>

      {Object.keys(filteredTasksByUser).length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-3">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
          <p className="text-gray-500">There are no tasks matching your filter criteria.</p>
          <Button 
            onClick={() => setStatusFilter('all')}
            className="mt-4"
          >
            Clear Filter
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(filteredTasksByUser).map(({ user: userData, tasks: userTasks }) => (
            <Card key={userData._id} className="overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleUserExpansion(userData._id)}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white font-semibold">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">{userData.name}</h3>
                    <p className="text-sm text-gray-500">{userData.email}</p>
                    <div className="text-xs text-gray-400 mt-1">
                      {userTasks.length} task{userTasks.length !== 1 ? 's' : ''}
                      {statusFilter !== 'all' && ` (${statusFilter})`}
                    </div>
                  </div>
                </div>
                <div className={`transform transition-transform ${expandedUsers[userData._id] ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {expandedUsers[userData._id] && (
                <div className="border-t border-gray-200 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userTasks.map(task => (
                      <Card key={task._id} className="p-3">
                        <div className="mb-2">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                        
                        <div className="text-xs text-gray-500 space-y-1 mb-3">
                          <div className="flex justify-between">
                            <span>Project:</span>
                            <span className="font-medium">{task.projectId?.title || 'Unassigned'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Due:</span>
                            <span className="font-medium">{new Date(task.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {/* Only show status dropdown to the assigned user */}
                          {user._id === task.assignedUserId._id && (
                            <select 
                              value={task.status} 
                              onChange={(e) => handleStatusChange(task._id, e.target.value)}
                              disabled={loading}
                              className="flex-1 min-w-[120px] text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                          )}
                          
                          {/* Show reopen button to admins for completed tasks */}
                          {user.role === 'admin' && task.status === 'Done' && (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleReopenTask(task)}
                              loading={loading}
                            >
                              Reopen
                            </Button>
                          )}
                          
                          {user.role === 'admin' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => onTaskDeleted(task._id)}
                              loading={loading}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </Card>
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