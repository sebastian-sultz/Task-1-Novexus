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
      const overdueTasks = tasksRes.data.filter(task => {
        return new Date(task.deadline) < new Date() && task.status !== 'Done';
      }).length;
      
      setStats({
        totalProjects: projectsRes.data.length,
        totalTasks: tasksRes.data.length,
        totalUsers: usersRes.data.length,
        overdueTasks,
      });
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
    setStats(prev => ({ ...prev, totalProjects: prev.totalProjects + 1 }));
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
      setStats(prev => ({ ...prev, totalProjects: prev.totalProjects - 1 }));
    } catch (error) {
      console.error('Error deleting project tasks:', error);
      setProjects(projects.filter(p => p._id !== projectId));
      setTasks(tasks.filter(t => t.projectId._id !== projectId));
      setStats(prev => ({ ...prev, totalProjects: prev.totalProjects - 1 }));
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
    setStats(prev => ({ ...prev, totalTasks: prev.totalTasks + 1 }));
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
    
    // Update overdue tasks count if status changed to Done
    if (updatedTask.status === 'Done') {
      const overdueTasks = tasks.filter(task => {
        return new Date(task.deadline) < new Date() && task.status !== 'Done';
      }).length;
      setStats(prev => ({ ...prev, overdueTasks }));
    }
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter(t => t._id !== taskId));
    setStats(prev => ({ ...prev, totalTasks: prev.totalTasks - 1 }));
  };

  const handleUserCreated = (newUser) => {
    setUsers([...users, newUser]);
    setStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
  };

  const handleUserDeleted = (userId) => {
    setUsers(users.filter(u => u._id !== userId));
    setProjects(projects.map(project => ({
      ...project,
      assignedUsers: project.assignedUsers.filter(user => user._id !== userId)
    })));
    setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
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
        <p className="mt-2 text-gray-600">Manage projects, tasks, and users</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-indigo-600">{stats.totalProjects}</div>
            <div className="text-sm text-gray-600 mt-1">Total Projects</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-purple-600">{stats.totalTasks}</div>
            <div className="text-sm text-gray-600 mt-1">Total Tasks</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-green-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600 mt-1">Total Users</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-red-600">{stats.overdueTasks}</div>
            <div className="text-sm text-gray-600 mt-1">Overdue Tasks</div>
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