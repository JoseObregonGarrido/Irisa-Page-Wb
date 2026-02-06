import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const user = getCurrentUser();
    return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
