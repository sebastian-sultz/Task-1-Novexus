import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Header from './components/Layout/Header'
import Sidebar from './components/Layout/Sidebar'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import AdminDashboard from './components/Dashboard/AdminDashboard'
import UserDashboard from './components/Dashboard/UserDashboard'
import Projects from './components/Dashboard/Projects'
import Tasks from './components/Dashboard/Tasks'
import Users from './components/Dashboard/Users'
import PrivateRoute from './components/Layout/PrivateRoute'
import './App.css'

function App() {
  const { user } = useAuth()

  return (
    <Router>
      <div className="App">
        <Header />
        <div className="app-container">
          {user && <Sidebar />}
          <div className="main-content">
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  {user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
                </PrivateRoute>
              } />
              <Route path="/projects" element={
                <PrivateRoute>
                  <Projects />
                </PrivateRoute>
              } />
              <Route path="/tasks" element={
                <PrivateRoute>
                  <Tasks />
                </PrivateRoute>
              } />
              <Route path="/users" element={
                <PrivateRoute adminOnly>
                  <Users />
                </PrivateRoute>
              } />
              <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App