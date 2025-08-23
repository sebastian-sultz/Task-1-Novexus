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
  const [taskViewMode, setTaskViewMode] = useState('list');

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
    const projectWithTasks = {
      ...newProject,
      tasks: []
    };
    setProjects([...projects, projectWithTasks]);
  };

  const handleProjectUpdated = async (updatedProject) => {
    try {
      const response = await api.get(`/projects/${updatedProject._id}`);
      setProjects(projects.map(p => p._id === updatedProject._id ? response.data : p));
    } catch (error) {
      console.error('Error fetching updated project:', error);
      setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));
    }
  };

  const handleProjectDeleted = async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}/tasks`);
      setProjects(projects.filter(p => p._id !== projectId));
      setTasks(tasks.filter(t => t.projectId._id !== projectId));
    } catch (error) {
      console.error('Error deleting project tasks:', error);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage projects, tasks, and users in one place</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'projects'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'tasks'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'projects' && (
            <div className="space-y-6">
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
            <div className="space-y-6">
              <CreateTask 
                projects={projects} 
                users={users}
                onTaskCreated={handleTaskCreated}
              />
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-medium text-gray-900">All Tasks</h3>
                <div className="flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => setTaskViewMode('list')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                      taskViewMode === 'list'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    List View
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskViewMode('byUser')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                      taskViewMode === 'byUser'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
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
      </div>
    </div>
  );
};

export default AdminDashboard;