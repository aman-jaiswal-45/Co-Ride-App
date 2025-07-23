import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
    const { user } = useSelector((state) => state.auth);
    
    // Check if user and user.data exists, then check their role
    if (user && user.data && user.data.role === 'Admin') {
        return children;
    }
    
    // Redirect to dashboard if not an admin
    return <Navigate to="/dashboard" />;
};

export default AdminRoute;