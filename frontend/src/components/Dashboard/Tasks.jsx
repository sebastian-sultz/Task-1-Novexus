import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks');
        setTasks(response.data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Tasks</h2>
      {tasks.map(task => (
        <div key={task._id}>
          <h3>{task.title}</h3>
          <p>Status: {task.status}</p>
        </div>
      ))}
    </div>
  );
};

export default Tasks;