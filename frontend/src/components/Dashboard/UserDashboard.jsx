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
      const userId = localStorage.getItem('userId');
      const userTasks = tasksRes.data.filter(task => task.assignedUserId && task.assignedUserId._id === userId);
      
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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  // This function will be called when a task is deleted elsewhere
  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
    
    // Update stats if task status changed
    if (updatedTask.assignedUserId && updatedTask.assignedUserId._id === localStorage.getItem('userId')) {
      const userTasks = tasks.filter(task => task.assignedUserId && task.assignedUserId._id === localStorage.getItem('userId'));
      
      const completedTasks = userTasks.filter(task => task.status === 'Done').length;
      const overdueTasks = userTasks.filter(task => {
        return new Date(task.deadline) < new Date() && task.status !== 'Done';
      }).length;
      const inProgressTasks = userTasks.filter(task => task.status === 'In Progress').length;
      
      setUserStats(prev => ({
        ...prev,
        completedTasks,
        overdueTasks,
        inProgressTasks,
      }));
    }
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter(t => t._id !== taskId));
    setUserStats(prev => ({ ...prev, totalTasks: prev.totalTasks - 1 }));
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your tasks and projects</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-indigo-600">{userStats.totalTasks}</div>
            <div className="text-sm text-gray-600 mt-1">Total Tasks</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-green-600">{userStats.completedTasks}</div>
            <div className="text-sm text-gray-600 mt-1">Completed</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-blue-600">{userStats.inProgressTasks}</div>
            <div className="text-sm text-gray-600 mt-1">In Progress</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-red-600">{userStats.overdueTasks}</div>
            <div className="text-sm text-gray-600 mt-1">Overdue</div>
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