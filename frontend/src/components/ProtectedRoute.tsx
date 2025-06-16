import React from 'react';
import { useAppSelector } from '../hooks/hooks';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const user = useAppSelector(state => state.auth.user);
  // If no user, send to /login
  if (!user) return <Navigate to="/login" replace />;
  // Otherwise render nested routes
  return <Outlet />;
}