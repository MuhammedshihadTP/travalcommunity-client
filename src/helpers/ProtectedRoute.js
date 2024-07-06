// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('token'); 
  const location = useLocation();


  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

 
  return element;
};

export default ProtectedRoute;
