import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TaskList from './TaskList';

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects')
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  // This function will be called when a task is deleted elsewhere
  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
  };

  const handleTaskDeleted = (taskId) => {
    // Remove the deleted task from the user's view
    setTasks(tasks.filter(t => t._id !== taskId));
  };

  // Listen for custom events when tasks are deleted elsewhere
  useEffect(() => {
    const handleTaskDeletedEvent = (event) => {
      const taskId = event.detail.taskId;
      handleTaskDeleted(taskId);
    };

    window.addEventListener('taskDeleted', handleTaskDeletedEvent);
    
    return () => {
      window.removeEventListener('taskDeleted', handleTaskDeletedEvent);
    };
  }, [tasks]);

  if (loading) return <div className="loading">Loading...</div>;

  // Filter tasks to show only those assigned to the current user
  const userTasks = tasks.filter(task => task.assignedUserId && task.assignedUserId._id === localStorage.getItem('userId'));
  
  // Filter projects to show only those assigned to the current user
  const userProjects = projects.filter(project => 
    project.assignedUsers.some(user => user._id === localStorage.getItem('userId'))
  );

  return (
    <div className="user-dashboard">
      <h2>My Dashboard</h2>
      
      <div className="tab-navigation">
        <button 
          className={activeTab === 'tasks' ? 'active' : ''}
          onClick={() => setActiveTab('tasks')}
        >
          My Tasks
        </button>
        <button 
          className={activeTab === 'projects' ? 'active' : ''}
          onClick={() => setActiveTab('projects')}
        >
          My Projects
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className="tab-content">
          <TaskList 
            tasks={userTasks} 
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="tab-content">
          <h3>My Projects</h3>
          {userProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <h4>No projects assigned</h4>
              <p>You are not assigned to any projects yet.</p>
            </div>
          ) : (
            <div className="project-cards">
              {userProjects.map(project => (
                <div key={project._id} className="project-card">
                  <div className="project-header">
                    <h4>{project.title}</h4>
                    <span className="project-status">
                      {project.tasks && project.tasks.length > 0 ? `${project.tasks.length} tasks` : 'No tasks'}
                    </span>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-meta">
                    <span>Created by: {project.createdBy.name}</span>
                    <span>Assigned users: {project.assignedUsers.map(u => u.name).join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;