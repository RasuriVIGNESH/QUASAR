import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

export default function ValidationAlert({ error }) {
    if (!error) return null;

    let errorMessage = '';

    // Check for validation errors from backend
    // Structure: { validationErrors: { field: "message" }, message: "Validation failed" }
    if (error.data && error.data.validationErrors) {
        errorMessage = Object.entries(error.data.validationErrors)
            .map(([field, msg]) => msg)
            .join('. ');
    } else if (error.message) {
        // Fallback to error.message
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else {
        errorMessage = "An unexpected error occurred.";
    }

    if (!errorMessage) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
        >
            <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-800">
                <AlertDescription className="font-medium">
                    {errorMessage}
                </AlertDescription>
            </Alert>
        </motion.div>
    );
}
