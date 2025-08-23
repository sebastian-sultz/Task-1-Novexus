import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ReopenTaskModal from './ReopenTaskModal';

const TaskList = ({ tasks, onTaskUpdated, onTaskDeleted, showAssignedUser = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { user } = useAuth();

  // Check if task is overdue
  const isOverdue = (task) => {
    return new Date(task.deadline) < new Date() && task.status !== 'Done';
  };

  // Check if task is due today
  const isDueToday = (task) => {
    const today = new Date();
    const deadline = new Date(task.deadline);
    return deadline.toDateString() === today.toDateString() && task.status !== 'Done';
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setLoading(true);
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      onTaskUpdated(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update task status');
    }
    setLoading(false);
  };

  const handleSubmitTask = async (taskId) => {
    try {
      setLoading(true);
      const response = await api.put(`/tasks/${taskId}/submit`);
      onTaskUpdated(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit task');
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
      setError(error.response?.data?.message || 'Failed to reopen task');
    }
    setLoading(false);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      setLoading(true);
      setError('');
      await api.delete(`/tasks/${taskId}`);
      
      // Emit a custom event to notify other components
      window.dispatchEvent(new CustomEvent('taskDeleted', { 
        detail: { taskId } 
      }));
      
      onTaskDeleted(taskId);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete task');
    }
    setLoading(false);
  };

  // Helper function to safely access nested properties
  const getProjectTitle = (task) => {
    return task.projectId?.title || 'No Project Assigned';
  };

  const getAssignedUserName = (task) => {
    return task.assignedUserId?.name || 'Unassigned';
  };

  // Format deadline date with warning colors
  const formatDeadline = (task) => {
    const deadline = new Date(task.deadline);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    
    if (isOverdue(task)) {
      return <span className="text-red-600 font-medium">
        {deadline.toLocaleDateString(undefined, options)} (Overdue)
      </span>;
    } else if (isDueToday(task)) {
      return <span className="text-amber-600 font-medium">
        {deadline.toLocaleDateString(undefined, options)} (Due Today)
      </span>;
    } else {
      return deadline.toLocaleDateString(undefined, options);
    }
  };

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
    <div className="task-list-container">
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
      
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-3">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
          <p className="text-gray-500">There are no tasks to display at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(task => (
            <div key={task._id} className={`bg-white rounded-lg shadow-sm border ${isOverdue(task) ? 'border-red-300' : isDueToday(task) ? 'border-amber-300' : 'border-gray-200'} p-4 transition-all hover:shadow-md`}>
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{task.description}</p>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Project:</span>
                  <span className="text-gray-700 font-medium">{getProjectTitle(task)}</span>
                </div>
                
                {showAssignedUser && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned to:</span>
                    <span className="text-gray-700 font-medium">{getAssignedUserName(task)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Deadline:</span>
                  <span className="text-gray-700 font-medium">{formatDeadline(task)}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* Only show status dropdown to the assigned user */}
                {user._id === task.assignedUserId._id && (
                  <select 
                    value={task.status} 
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    disabled={loading || task.status === 'Done'}
                    className="flex-1 min-w-[120px] text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                )}
                
                {/* Only show submit button to the assigned user */}
                {task.status !== 'Done' && user._id === task.assignedUserId._id && (
                  <button 
                    onClick={() => handleSubmitTask(task._id)} 
                    disabled={loading}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    Submit
                  </button>
                )}
                
                {/* Show reopen button to admins for completed tasks */}
                {task.status === 'Done' && user.role === 'admin' && (
                  <button 
                    onClick={() => handleReopenTask(task)} 
                    disabled={loading}
                    className="px-3 py-1 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    Reopen
                  </button>
                )}
                
                {user.role === 'admin' && (
                  <button 
                    onClick={() => handleDelete(task._id)} 
                    disabled={loading}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>
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

export default TaskList;