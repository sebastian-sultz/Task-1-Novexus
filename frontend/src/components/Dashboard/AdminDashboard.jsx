import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CreateProject from './CreateProject';
import CreateTask from './CreateTask';
import ProjectList from './ProjectList';
import TaskList from './TaskList';
import TaskByUserView from './TaskByUserView';
import UserManagement from './UserManagement';
import Card from '../Common/Card';
import Button from '../Common/Button';

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [taskViewMode, setTaskViewMode] = useState('list');
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    totalUsers: 0,
    overdueTasks: 0,
  });

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
      
      // Calculate stats
      calculateStats(projectsRes.data, tasksRes.data, usersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const calculateStats = (projectsData, tasksData, usersData) => {
    const overdueTasks = tasksData.filter(task => {
      return new Date(task.deadline) < new Date() && task.status !== 'Done';
    }).length;
    
    setStats({
      totalProjects: projectsData.length,
      totalTasks: tasksData.length,
      totalUsers: usersData.length,
      overdueTasks,
    });
  };

  const handleProjectCreated = (newProject) => {
    const projectWithTasks = {
      ...newProject,
      tasks: []
    };
    const updatedProjects = [...projects, projectWithTasks];
    setProjects(updatedProjects);
    calculateStats(updatedProjects, tasks, users);
  };

  const handleProjectUpdated = async (updatedProject) => {
    try {
      const response = await api.get(`/projects/${updatedProject._id}`);
      const updatedProjects = projects.map(p => p._id === updatedProject._id ? response.data : p);
      setProjects(updatedProjects);
      calculateStats(updatedProjects, tasks, users);
    } catch (error) {
      console.error('Error fetching updated project:', error);
      const updatedProjects = projects.map(p => p._id === updatedProject._id ? updatedProject : p);
      setProjects(updatedProjects);
      calculateStats(updatedProjects, tasks, users);
    }
  };

  const handleProjectDeleted = async (projectId) => {
    try {
      // Delete all tasks associated with the project
      await api.delete(`/projects/${projectId}/tasks`);
      
      // Update local state
      const updatedProjects = projects.filter(p => p._id !== projectId);
      const updatedTasks = tasks.filter(t => t.projectId?._id !== projectId);
      
      setProjects(updatedProjects);
      setTasks(updatedTasks);
      
      // Recalculate all stats
      calculateStats(updatedProjects, updatedTasks, users);
    } catch (error) {
      console.error('Error deleting project tasks:', error);
      
      // Fallback: update local state even if API call fails
      const updatedProjects = projects.filter(p => p._id !== projectId);
      const updatedTasks = tasks.filter(t => t.projectId?._id !== projectId);
      
      setProjects(updatedProjects);
      setTasks(updatedTasks);
      
      // Recalculate all stats
      calculateStats(updatedProjects, updatedTasks, users);
    }
  };

  const handleTaskCreated = (newTask) => {
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    calculateStats(projects, updatedTasks, users);
  };

  const handleTaskUpdated = (updatedTask) => {
    const updatedTasks = tasks.map(t => t._id === updatedTask._id ? updatedTask : t);
    setTasks(updatedTasks);
    calculateStats(projects, updatedTasks, users);
  };

  const handleTaskDeleted = (taskId) => {
    const updatedTasks = tasks.filter(t => t._id !== taskId);
    setTasks(updatedTasks);
    calculateStats(projects, updatedTasks, users);
  };

  const handleUserCreated = (newUser) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    calculateStats(projects, tasks, updatedUsers);
  };

  const handleUserDeleted = (userId) => {
    const updatedUsers = users.filter(u => u._id !== userId);
    const updatedProjects = projects.map(project => ({
      ...project,
      assignedUsers: project.assignedUsers.filter(user => user._id !== userId)
    }));
    
    setUsers(updatedUsers);
    setProjects(updatedProjects);
    calculateStats(updatedProjects, tasks, updatedUsers);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage projects, tasks, and users</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Projects Card */}
        <Card className="bg-white border-l-4 border-indigo-500">
          <div className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-indigo-100 p-3 mr-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalProjects}</h3>
                <p className="text-sm text-gray-500">Total Projects</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Total Tasks Card */}
        <Card className="bg-white border-l-4 border-purple-500">
          <div className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalTasks}</h3>
                <p className="text-sm text-gray-500">Total Tasks</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Total Users Card */}
        <Card className="bg-white border-l-4 border-green-500">
          <div className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
                <p className="text-sm text-gray-500">Total Users</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Overdue Tasks Card */}
        <Card className="bg-white border-l-4 border-red-500">
          <div className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-3 mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.overdueTasks}</h3>
                <p className="text-sm text-gray-500">Overdue Tasks</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <Card>
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
                  <Button
                    variant={taskViewMode === 'list' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTaskViewMode('list')}
                    className="rounded-r-none"
                  >
                    List View
                  </Button>
                  <Button
                    variant={taskViewMode === 'byUser' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTaskViewMode('byUser')}
                    className="rounded-l-none"
                  >
                    Group by User
                  </Button>
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
      </Card>
    </div>
  );
};

export default AdminDashboard;