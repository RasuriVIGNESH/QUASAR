import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const MentorRoute = ({ children }) => {
    const { userProfile, loading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        if (!loading) {
            if (!userProfile) {
                setIsAuthorized(false);
            } else {
                // Check for MENTOR role
                const hasMentorRole = userProfile.role === 'MENTOR' || userProfile.roles?.some(r => r.name === 'MENTOR' || r === 'MENTOR');

                setIsAuthorized(Boolean(hasMentorRole));

                if (!hasMentorRole && userProfile) {
                    console.warn('Access denied: User does not have MENTOR role.', userProfile.role, userProfile.roles);
                    toast.error('Access Restricted: Mentors Only');
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

export default MentorRoute;
