import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TaskList from './TaskList';
import Card from '../Common/Card';
import Button from '../Common/Button';

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    inProgressTasks: 0,
  });

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
      
      // Calculate user stats
      calculateUserStats(tasksRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const calculateUserStats = (tasksData) => {
    const userId = localStorage.getItem('userId');
    const userTasks = tasksData.filter(task => task.assignedUserId && task.assignedUserId._id === userId);
    
    const completedTasks = userTasks.filter(task => task.status === 'Done').length;
    const overdueTasks = userTasks.filter(task => {
      return new Date(task.deadline) < new Date() && task.status !== 'Done';
    }).length;
    const inProgressTasks = userTasks.filter(task => task.status === 'In Progress').length;
    
    setUserStats({
      totalTasks: userTasks.length,
      completedTasks,
      overdueTasks,
      inProgressTasks,
    });
  };

  // This function will be called when a task is updated elsewhere
  const handleTaskUpdated = (updatedTask) => {
    const updatedTasks = tasks.map(t => t._id === updatedTask._id ? updatedTask : t);
    setTasks(updatedTasks);
    
    // Recalculate stats with the updated tasks
    calculateUserStats(updatedTasks);
  };

  const handleTaskDeleted = (taskId) => {
    const updatedTasks = tasks.filter(t => t._id !== taskId);
    setTasks(updatedTasks);
    
    // Recalculate stats with the updated tasks
    calculateUserStats(updatedTasks);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Filter tasks to show only those assigned to the current user
  const userTasks = tasks.filter(task => task.assignedUserId && task.assignedUserId._id === localStorage.getItem('userId'));
  
  // Filter projects to show only those assigned to the current user
  const userProjects = projects.filter(project => 
    project.assignedUsers.some(user => user._id === localStorage.getItem('userId'))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your tasks and projects</p>
      </div>
      
      {/* Stats Cards - Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Tasks Card */}
        <Card className="bg-white border-l-4 border-indigo-500">
          <div className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-indigo-100 p-3 mr-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{userStats.totalTasks}</h3>
                <p className="text-sm text-gray-500">Total Tasks</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Completed Tasks Card */}
        <Card className="bg-white border-l-4 border-green-500">
          <div className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{userStats.completedTasks}</h3>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </div>
        </Card>

        {/* In Progress Tasks Card */}
        <Card className="bg-white border-l-4 border-blue-500">
          <div className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{userStats.inProgressTasks}</h3>
                <p className="text-sm text-gray-500">In Progress</p>
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
                <h3 className="text-2xl font-bold text-gray-900">{userStats.overdueTasks}</h3>
                <p className="text-sm text-gray-500">Overdue</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'tasks'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'projects'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Projects
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">My Tasks</h2>
                <span className="text-sm text-gray-500">
                  {userTasks.length} task{userTasks.length !== 1 ? 's' : ''}
                </span>
              </div>
              <TaskList 
                tasks={userTasks} 
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
              />
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">My Projects</h2>
                <span className="text-sm text-gray-500">
                  {userProjects.length} project{userProjects.length !== 1 ? 's' : ''}
                </span>
              </div>
              {userProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-3">📂</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No projects assigned</h3>
                  <p className="text-gray-500">You are not assigned to any projects yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProjects.map(project => (
                    <Card key={project._id} hover className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {project.tasks?.length || 0} tasks
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Created by: {project.createdBy.name}</p>
                        <p>Assigned users: {project.assignedUsers.map(u => u.name).join(', ')}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UserDashboard;