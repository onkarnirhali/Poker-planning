// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './features/home/HomePage';
import SessionsPage from './features/sessions/SessionsPage';
import NewSessionPage from './features/sessions/NewSessionsPage';
import SessionManagementPage from './features/sessions/SessionManagementPage';
import LoginPage from './features/auth/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import VotingPage from './features/voting/VotingPage';
import Layout from './components/Layout';

export default function App({ toggleMode }: { toggleMode: () => void }) {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route element={<Layout toggleMode={toggleMode} />}></Route>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/sessions/new" element={<NewSessionPage />} />
        <Route path="/sessions/:sessionId" element={<SessionManagementPage />} />
        <Route path="/sessions/:sessionId/vote" element={<VotingPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}