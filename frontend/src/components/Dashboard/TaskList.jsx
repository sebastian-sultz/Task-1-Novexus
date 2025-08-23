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

 // In the handleDelete function, add event emission
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
      return <span className="deadline-overdue">
        {deadline.toLocaleDateString(undefined, options)} (Overdue)
      </span>;
    } else if (isDueToday(task)) {
      return <span className="deadline-due-soon">
        {deadline.toLocaleDateString(undefined, options)} (Due Today)
      </span>;
    } else {
      return deadline.toLocaleDateString(undefined, options);
    }
  };

  return (
    <div className="task-list-container">
      <h3>Tasks</h3>
      {error && <div className="error-message">{error}</div>}
      
      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h4>No tasks found</h4>
          <p>There are no tasks to display at this time.</p>
        </div>
      ) : (
        <div className="task-grid">
          {tasks.map(task => (
            <div key={task._id} className={`task-card ${isOverdue(task) ? 'overdue' : ''} ${isDueToday(task) ? 'due-soon' : ''}`}>
              <div className="task-header">
                <h4>{task.title}</h4>
                <span className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
                  {task.status}
                </span>
              </div>
              
              <p className="task-description">{task.description}</p>
              
              <div className="task-details">
                <div className="task-detail">
                  <span className="detail-label">Project:</span>
                  <span className="detail-value">{getProjectTitle(task)}</span>
                </div>
                
                {showAssignedUser && (
                  <div className="task-detail">
                    <span className="detail-label">Assigned to:</span>
                    <span className="detail-value">{getAssignedUserName(task)}</span>
                  </div>
                )}
                
                <div className="task-detail">
                  <span className="detail-label">Deadline:</span>
                  <span className="detail-value">{formatDeadline(task)}</span>
                </div>
                
                <div className="task-detail">
                  <span className="detail-label">Status:</span>
                  {/* Only show status dropdown to the assigned user */}
                  {user._id === task.assignedUserId._id ? (
                    <select 
                      value={task.status} 
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      disabled={loading || task.status === 'Done'}
                      className="status-select"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  ) : (
                    <span className="status-text">{task.status}</span>
                  )}
                </div>
              </div>
              
              <div className="task-actions">
                {/* Only show submit button to the assigned user */}
                {task.status !== 'Done' && user._id === task.assignedUserId._id && (
                  <button 
                    onClick={() => handleSubmitTask(task._id)} 
                    disabled={loading}
                    className="btn btn-success"
                  >
                    Submit Task
                  </button>
                )}
                
                {/* Show reopen button to admins for completed tasks */}
                {task.status === 'Done' && user.role === 'admin' && (
                  <button 
                    onClick={() => handleReopenTask(task)} 
                    disabled={loading}
                    className="btn btn-warning"
                  >
                    Reopen Task
                  </button>
                )}
                
                {user.role === 'admin' && (
                  <button 
                    onClick={() => handleDelete(task._id)} 
                    disabled={loading}
                    className="btn btn-danger"
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