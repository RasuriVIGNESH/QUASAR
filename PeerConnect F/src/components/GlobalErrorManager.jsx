import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';

/**
 * Validates global errors and redirects if necessary.
 * Must be placed inside Router context.
 */
export default function GlobalErrorManager() {
    const navigate = useNavigate();

    useEffect(() => {
        // Register the error handler
        apiService.setOnError((error) => {
            if (error.status === 500) {
                navigate('/server-error'); // You need to add this route to App.jsx
            }
        });

        // Cleanup
        return () => {
            apiService.setOnError(null);
        };
    }, [navigate]);

    return null;
}
