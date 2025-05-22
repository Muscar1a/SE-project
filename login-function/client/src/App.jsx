// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Navbar from './components/layout/Navbar';
import Alert from './components/layout/Alert';
import AuthDebug from './components/debug/AuthDebug'; // Add this for debugging

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyTwoFactor from './pages/VerifyTwoFactor';
import Profile from './pages/Profile';
import PrivateRoute from './components/routing/PrivateRoute';

// Escrow Pages
import EscrowCreate from './pages/escrow/Create';
import EscrowDetails from './pages/escrow/Details';
import EscrowList from './pages/escrow/List';

// Context
import AuthState from './context/auth/AuthState';
import AlertState from './context/alert/AlertState';
import EscrowState from './context/escrow/EscrowState';

import './App.css';

// Make axios available globally for debugging
import axios from 'axios';
window.axios = axios;

const App = () => {
  return (
    <AuthState>
      <AlertState>
        <EscrowState>
          <Router>
            <div className="App">
              <Navbar />
              <AuthDebug /> {/* Add this for debugging */}
              <div className="container">
                <Alert />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/verify-2fa" element={<VerifyTwoFactor />} />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/escrow"
                    element={
                      <PrivateRoute>
                        <EscrowList />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/escrow/create"
                    element={
                      <PrivateRoute>
                        <EscrowCreate />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/escrow/:orderId"
                    element={
                      <PrivateRoute>
                        <EscrowDetails />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </div>
            </div>
          </Router>
        </EscrowState>
      </AlertState>
    </AuthState>
  );
};

export default App;
