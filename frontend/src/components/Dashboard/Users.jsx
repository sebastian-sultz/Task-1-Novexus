import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Users</h2>
      {users.map(user => (
        <div key={user._id}>
          <h3>{user.name}</h3>
          <p>{user.email} ({user.role})</p>
        </div>
      ))}
    </div>
  );
};

export default Users;