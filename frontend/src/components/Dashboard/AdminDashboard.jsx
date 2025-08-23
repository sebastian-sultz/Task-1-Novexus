import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CreateProject from './CreateProject';
import CreateTask from './CreateTask';
import ProjectList from './ProjectList';
import TaskList from './TaskList';
import TaskByUserView from './TaskByUserView';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [taskViewMode, setTaskViewMode] = useState('list'); // 'list' or 'byUser'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, tasksRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/tasks'),
        api.get('/users')
      ]);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

 const handleProjectCreated = (newProject) => {
  // Add empty tasks array to new project
  const projectWithTasks = {
    ...newProject,
    tasks: [] // New projects won't have any tasks initially
  };
  setProjects([...projects, projectWithTasks]);
};

 const handleProjectUpdated = async (updatedProject) => {
  try {
    // Fetch the updated project with its tasks
    const response = await api.get(`/projects/${updatedProject._id}`);
    setProjects(projects.map(p => p._id === updatedProject._id ? response.data : p));
  } catch (error) {
    console.error('Error fetching updated project:', error);
    // Fallback to the original update if fetching fails
    setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));
  }
};
  const handleProjectDeleted = async (projectId) => {
  try {
    // First, delete all tasks associated with this project from the backend
    await api.delete(`/projects/${projectId}/tasks`);
    
    // Then update the frontend state
    setProjects(projects.filter(p => p._id !== projectId));
    setTasks(tasks.filter(t => t.projectId._id !== projectId));
  } catch (error) {
    console.error('Error deleting project tasks:', error);
    // Still remove from frontend even if backend fails
    setProjects(projects.filter(p => p._id !== projectId));
    setTasks(tasks.filter(t => t.projectId._id !== projectId));
  }
};

  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
  };

 const handleTaskDeleted = (taskId) => {
  setTasks(tasks.filter(t => t._id !== taskId));
};

  const handleUserCreated = (newUser) => {
    setUsers([...users, newUser]);
  };

  const handleUserDeleted = (userId) => {
    setUsers(users.filter(u => u._id !== userId));
    setProjects(projects.map(project => ({
      ...project,
      assignedUsers: project.assignedUsers.filter(user => user._id !== userId)
    })));
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="tab-navigation">
        <button 
          onClick={() => setActiveTab('projects')} 
          className={activeTab === 'projects' ? 'active' : ''}
        >
          Projects
        </button>
        <button 
          onClick={() => setActiveTab('tasks')} 
          className={activeTab === 'tasks' ? 'active' : ''}
        >
          Tasks
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={activeTab === 'users' ? 'active' : ''}
        >
          Users
        </button>
      </div>

      {activeTab === 'projects' && (
        <div>
          <CreateProject onProjectCreated={handleProjectCreated} users={users} />
          <ProjectList 
            projects={projects} 
            users={users}
            onProjectUpdated={handleProjectUpdated}
            onProjectDeleted={handleProjectDeleted}
          />
        </div>
      )}

      {activeTab === 'tasks' && (
        <div>
          <div className="tasks-header">
            <CreateTask 
              projects={projects} 
              users={users}
              onTaskCreated={handleTaskCreated}
            />
            
            <div className="view-toggle">
              <button 
                className={taskViewMode === 'list' ? 'active' : ''}
                onClick={() => setTaskViewMode('list')}
              >
                List View
              </button>
              <button 
                className={taskViewMode === 'byUser' ? 'active' : ''}
                onClick={() => setTaskViewMode('byUser')}
              >
                Group by User
              </button>
            </div>
          </div>
          
          {taskViewMode === 'list' ? (
            <TaskList 
              tasks={tasks} 
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
              showAssignedUser={true}
            />
          ) : (
            <TaskByUserView 
              tasks={tasks} 
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
            />
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <UserManagement 
          users={users}
          onUserCreated={handleUserCreated}
          onUserDeleted={handleUserDeleted}
        />
      )}
    </div>
  );
};

export default AdminDashboard;