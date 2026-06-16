// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const ProtectedRoute = ({ children, allowedRoles = [] }) => {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - Loading:', loading);
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Allowed roles:', allowedRoles);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('User role not allowed, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('Rendering protected content');
  return children;
};

export default ProtectedRoute;