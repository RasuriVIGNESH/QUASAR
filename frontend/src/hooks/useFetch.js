import { useState, useEffect, useRef, useCallback } from 'react';
import apiService from '@/services/api';

/**
 * useFetch Hook - Stale-While-Revalidate Pattern with Persistence
 * 
 * Implements the SWR pattern for optimal performance:
 * 1. Returns cached data immediately (from memory or localStorage)
 * 2. Revalidates in the background
 * 3. Updates UI when fresh data arrives
 * 4. Handles errors gracefully
 * 
 * @param {string} endpoint - API endpoint to fetch
 * @param {Object} params - Query parameters
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, refetch, isValidating, invalidate }
 */
export function useFetch(endpoint, params = {}, options = {}) {
    const {
        method = 'GET',
        body = null,
        skip = false,
        cacheTTL = 30000,
        persist = false, // Enable localStorage persistence
        revalidateOnFocus = true,
        revalidateInterval = 0,
        dedupingInterval = 2000,
        onSuccess = null,
        onError = null,
        compareData = null
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState(null);
    const [isValidating, setIsValidating] = useState(false);

    const revalidateIntervalRef = useRef(null);
    const lastFetchRef = useRef(0);
    const isMounted = useRef(true);

    // Generate unique request key (reusing apiService logic)
    const generateRequestKey = useCallback(() => {
        return apiService.generateCacheKey(endpoint, { method, params, body });
    }, [method, endpoint, params, body]);

    // Fetch data from API
    const fetchData = useCallback(async (isRevalidation = false) => {
        if (skip || !endpoint) return;

        const now = Date.now();
        // Prevent duplicate requests within deduping interval
        if (isRevalidation && now - lastFetchRef.current < dedupingInterval) {
            return;
        }

        try {
            if (!isRevalidation) setLoading(true);
            setIsValidating(true);
            setError(null);

            const response = await apiService.request(endpoint, {
                method,
                params,
                body,
                cacheTTL,
                persist,
                skipCache: isRevalidation // Force fresh data on revalidation
            });

            if (isMounted.current) {
                // Check if data has actually changed if compareData is provided
                if (compareData && data) {
                    if (!compareData(data, response)) {
                        setData(response);
                        if (onSuccess) onSuccess(response);
                    }
                } else {
                    setData(response);
                    if (onSuccess) onSuccess(response);
                }

                lastFetchRef.current = Date.now();
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err);
                if (onError) onError(err);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
                setIsValidating(false);
            }
        }
    }, [endpoint, params, method, body, cacheTTL, persist, dedupingInterval, compareData, data, onSuccess, onError]);

    // Initial fetch with SWR pattern
    useEffect(() => {
        isMounted.current = true;

        if (skip) {
            setLoading(false);
            return;
        }

        // 1. Try to get cached data first (Memory or LocalStorage)
        const cacheKey = generateRequestKey();
        const cachedData = apiService.getFromCache(cacheKey, persist);

        if (cachedData) {
            setData(cachedData);
            setLoading(false);
            // Revalidate in background
            fetchData(true);
        } else {
            // No cache, fetch immediately
            fetchData(false);
        }

        return () => {
            isMounted.current = false;
            if (revalidateIntervalRef.current) clearInterval(revalidateIntervalRef.current);
        };
    }, [endpoint, JSON.stringify(params), skip, persist, generateRequestKey, fetchData]);

    // Revalidate on interval
    useEffect(() => {
        if (skip || revalidateInterval <= 0) return;

        revalidateIntervalRef.current = setInterval(() => {
            fetchData(true);
        }, revalidateInterval);

        return () => {
            if (revalidateIntervalRef.current) clearInterval(revalidateIntervalRef.current);
        };
    }, [skip, revalidateInterval, fetchData]);

    // Revalidate on window focus
    useEffect(() => {
        if (skip || !revalidateOnFocus) return;

        const handleFocus = () => {
            // Revalidate if tab becomes active
            fetchData(true);
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [skip, revalidateOnFocus, fetchData]);

    // Manual refetch function
    const refetch = useCallback(() => fetchData(true), [fetchData]);

    // Manual invalidate function
    const invalidate = useCallback(() => {
        apiService.invalidateCache(endpoint);
        setData(null);
        fetchData(false);
    }, [endpoint, fetchData]);

    return {
        data,
        loading,
        error,
        isValidating,
        refetch,
        invalidate
    };
}

export default useFetch;
