import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import ChatLayout from './components/ChatLayout';

import HomePage from './pages/HomePage';
import DetectionPage from './pages/DetectionPage';
import DietPlansPage from './pages/DietPlansPage';
import TrackerPage from './pages/TrackerPage';
import DietTrackerPage from './pages/DietTrackerPage';
import CommunityChatPage from './pages/CommunityChatPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <ChatLayout>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Signup />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              <Route path="/detection" element={
                <ProtectedRoute>
                  <DetectionPage />
                </ProtectedRoute>
              } />
              <Route path="/diet-plans" element={
                <ProtectedRoute>
                  <DietPlansPage />
                </ProtectedRoute>
              } />
              <Route path="/tracker" element={
                <ProtectedRoute>
                  <TrackerPage />
                </ProtectedRoute>
              } />
              <Route path="/diet-tracker" element={
                <ProtectedRoute>
                  <DietTrackerPage />
                </ProtectedRoute>
              } />
              <Route path="/community-chat" element={
                <ProtectedRoute>
                  <CommunityChatPage />
                </ProtectedRoute>
              } />
            </Routes>
          </ChatLayout>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
