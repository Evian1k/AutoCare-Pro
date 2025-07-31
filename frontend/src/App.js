import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import IncidentReports from './components/IncidentReports';
import Services from './components/Services';
import Appointments from './components/Appointments';
import Vehicles from './components/Vehicles';
import Parts from './components/Parts';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
          
          <Routes>
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? 
                <Login onLogin={handleLogin} /> : 
                <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? 
                <Register /> : 
                <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? 
                <Dashboard user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/incident-reports" 
              element={
                isAuthenticated ? 
                <IncidentReports user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/services" 
              element={
                isAuthenticated ? 
                <Services user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/appointments" 
              element={
                isAuthenticated ? 
                <Appointments user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/vehicles" 
              element={
                isAuthenticated ? 
                <Vehicles user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/parts" 
              element={
                isAuthenticated ? 
                <Parts user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <Navigate to="/login" />
              } 
            />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;