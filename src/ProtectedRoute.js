import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Logged in but wrong role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'student') return <Navigate to="/dashboard" />;
    if (user.role === 'teacher') return <Navigate to="/teacher" />;
    if (user.role === 'admin') return <Navigate to="/admin" />;
  }

  return children;
}

export default ProtectedRoute;