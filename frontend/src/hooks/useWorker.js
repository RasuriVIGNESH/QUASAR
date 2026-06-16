import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useWorker Hook
 * 
 * Safely manages a Web Worker instance within a React component.
 * 
 * @param {string} workerPath - Path to the worker file
 */
const useWorker = (workerPath) => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const workerRef = useRef(null);

    useEffect(() => {
        // Initialize worker
        try {
            // Note: In Vite, workers are often imported with ?worker suffix
            // This is a generic implementation
            workerRef.current = new Worker(new URL(workerPath, import.meta.url), { type: 'module' });

            workerRef.current.onmessage = (e) => {
                setResult(e.data.data);
                setLoading(false);
            };

            workerRef.current.onerror = (e) => {
                setError(e.message);
                setLoading(false);
            };
        } catch (err) {
            setError('Failed to initialize worker');
        }

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, [workerPath]);

    const postMessage = useCallback((type, payload) => {
        if (!workerRef.current) return;
        setLoading(true);
        workerRef.current.postMessage({ type, payload });
    }, []);

    return { result, loading, error, postMessage };
};

export default useWorker;
