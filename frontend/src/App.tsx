// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './features/home/HomePage';
import SessionsPage from './features/sessions/SessionsPage';
import NewSessionPage from './features/sessions/NewSessionsPage';
import SessionPage from './features/sessions/SessionsPage';
import LoginPage from './features/auth/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/sessions/new" element={<NewSessionPage />} />
        <Route path="/sessions/:sessionId" element={<SessionPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}