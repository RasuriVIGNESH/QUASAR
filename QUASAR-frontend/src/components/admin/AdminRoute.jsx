import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const AdminRoute = ({ children }) => {
    const { userProfile, loading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        if (!loading) {
            if (!userProfile) {
                setIsAuthorized(false);
            } else {
                // Check for ADMIN role
                // Adjust this check based on actual API response structure for roles
                // Assuming roles is an array of objects ({id, name}) or strings
                const hasAdminRole = userProfile.roles?.some(r => r.name === 'ADMIN' || r === 'ADMIN');

                // OR checks depending on how your backend sends it (AdminController usually implies ROLE_ADMIN)
                // If you are testing and don't have the role yet, you might temporarily allow all for dev:
                // setIsAuthorized(true); 

                setIsAuthorized(hasAdminRole);

                if (!hasAdminRole && userProfile) {
                    console.warn('Access denied: User does not have ADMIN role.', userProfile.roles);
                    toast.error('Access Restricted: Admins Only');
                }
            }
        }
    }, [loading, userProfile]);

    if (loading || isAuthorized === null) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!userProfile) {
        return <Navigate to="/login" replace />;
    }

    return isAuthorized ? children : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
