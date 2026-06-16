import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

/**
 * GlobalErrorManager Component
 * 
 * Handles all global errors and displays them as toast notifications.
 */
export default function GlobalErrorManager() {
    useEffect(() => {
        /**
         * Global error handler that displays errors as toast notifications
         */
        const handleGlobalError = (error) => {
            // Handle different error statuses
            switch (error.status) {
                case 401:
                    // Session expired handled by redirect, but show toast for context
                    toast.error('Session expired. Please login again.');
                    break;

                case 403:
                    toast.error('You do not have permission to access this resource.');
                    break;

                case 404:
                    // Don't show global toast for 404s to avoid noise
                    // Individual components can handle their own 404s if needed
                    break;

                case 500:
                    toast.error('Something went wrong. Please try again later.');
                    break;

                default:
                    // Only show toast if it's a real error and not already handled
                    if (error.status && error.status >= 400) {
                        toast.error(error.message || 'An unexpected error occurred.');
                    }
            }
        };

        // Register the global error handler
        apiService.setOnError(handleGlobalError);

        // Handle unhandled promise rejections
        const handleUnhandledRejection = (event) => {
            // Skip already handled errors to prevent double toasts
            if (event.reason?._handled) return;

            console.error('Unhandled promise rejection:', event.reason);
            toast.error('An unexpected error occurred. Please refresh the page.');
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        // Cleanup
        return () => {
            apiService.setOnError(null);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    return null;
}
