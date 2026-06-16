// src/services/api.js
// Production-grade API service with request deduplication, coalescing, and smart persistent caching

import { API_CONFIG } from '../config/api.js';

const PERSISTENT_PREFIX = 'quasar_cache_';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.onError = null;
    this.navigateFn = null;

    // Request deduplication: Map to track in-flight requests
    this.inFlightRequests = new Map();

    // Short-lived in-memory cache
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.cacheTTL = 30000; // 30 seconds default TTL

    // Periodic cleanup of expired cache entries every 60 seconds
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanExpiredCache(), 60000);
    }
  }

  /**
   * Register navigation function from React Router
   */
  setNavigate(navigate) {
    this.navigateFn = navigate;
  }

  /**
   * Periodic cleanup of expired cache entries (Memory + LocalStorage)
   */
  cleanExpiredCache() {
    const now = Date.now();

    // Clean memory
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }

    // Clean localStorage
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(PERSISTENT_PREFIX)) {
          const item = JSON.parse(localStorage.getItem(key));
          if (item.expiry < now) localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('LocalStorage cleanup failed', e);
    }
  }

  /**
   * Generate a unique cache key from request parameters
   */
  generateCacheKey(endpoint, options = {}) {
    const method = options.method || 'GET';
    const params = options.params ? JSON.stringify(options.params) : '';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${endpoint}:${params}:${body}`;
  }

  /**
   * Get data from cache (Memory first, then LocalStorage)
   */
  getFromCache(cacheKey, persist = false) {
    const now = Date.now();

    // 1. Check Memory
    const expiry = this.cacheExpiry.get(cacheKey);
    if (expiry && now < expiry) {
      return this.cache.get(cacheKey);
    }

    // 2. Check LocalStorage if persistence requested
    if (persist) {
      try {
        const storageKey = PERSISTENT_PREFIX + btoa(cacheKey);
        const storageItem = localStorage.getItem(storageKey);
        if (storageItem) {
          const parsed = JSON.parse(storageItem);
          if (parsed.expiry > now) {
            // Backfill memory
            this.cache.set(cacheKey, parsed.data);
            this.cacheExpiry.set(cacheKey, parsed.expiry);
            return parsed.data;
          }
          localStorage.removeItem(storageKey);
        }
      } catch (e) {
        console.warn('Cache retrieval from storage failed', e);
      }
    }

    return null;
  }

  /**
   * Store data in cache (Memory + optional LocalStorage)
   */
  setCache(cacheKey, data, ttl, persist = false) {
    const finalTTL = ttl || this.cacheTTL;
    const expiry = Date.now() + finalTTL;

    // Store in memory
    this.cache.set(cacheKey, data);
    this.cacheExpiry.set(cacheKey, expiry);

    // Store in localStorage if persistence requested
    if (persist) {
      try {
        const storageKey = PERSISTENT_PREFIX + btoa(cacheKey);
        localStorage.setItem(storageKey, JSON.stringify({
          data,
          expiry,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Cache persistence failed', e);
      }
    }
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();

    // Clear storage
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(PERSISTENT_PREFIX)) localStorage.removeItem(key);
      });
    } catch (e) { }
  }

  /**
   * Set global error handler
   */
  setOnError(handler) {
    this.onError = handler;
  }

  /**
   * Auth methods
   */
  setToken(token) {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  clearSession() {
    localStorage.removeItem('token');
  }

  getHeaders(includeAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (includeAuth && token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  redirectToLogin() {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      if (this.navigateFn) this.navigateFn('/login');
      else window.location.href = '/login';
    }
  }

  /**
   * Generic request method with deduplication, memory caching, and persistence
   */
  async request(endpoint, options = {}) {
    const {
      skipCache,
      preventRedirect,
      includeAuth,
      params,
      cacheTTL,
      persist = false, // Persistence option
      ...fetchConfig
    } = options;

    let url = `${this.baseURL}${endpoint}`;
    if (params) {
      const query = new URLSearchParams(params).toString();
      if (query) url += `?${query}`;
    }

    const config = {
      headers: this.getHeaders(includeAuth !== false),
      ...fetchConfig,
    };

    const cacheKey = this.generateCacheKey(endpoint, options);
    const isGet = config.method === 'GET' || !config.method;

    // 1. Check Cache (GET only)
    if (isGet && !skipCache) {
      const cachedData = this.getFromCache(cacheKey, persist);
      if (cachedData) return cachedData;

      // 2. Check for in-flight request (deduplication)
      if (this.inFlightRequests.has(cacheKey)) {
        return this.inFlightRequests.get(cacheKey);
      }
    }

    const fetchPromise = (async () => {
      try {
        const response = await fetch(url, config);

        if (response.status === 204 || !response.headers.get('content-type')?.includes('application/json')) {
          if (response.ok) return response.text();
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!response.ok) {
          const error = new Error(data.message || `HTTP error! status: ${response.status}`);
          error.data = data;
          error.status = response.status;
          error._handled = true;

          if (response.status === 401) {
            this.clearSession();
            if (preventRedirect !== true) this.redirectToLogin();
          }

          if (this.onError) this.onError(error);
          throw error;
        }

        // 3. Cache successful GET responses
        if (isGet) {
          this.setCache(cacheKey, data, cacheTTL, persist);
        } else {
          // Mutation: Auto-invalidate cache for this endpoint prefix
          this.invalidateCache(endpoint);
        }

        return data;
      } catch (error) {
        if (!error._handled) {
          console.error('API request failed:', url, error);
          if (this.onError) this.onError(error);
          error._handled = true;
        }
        throw error;
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    if (isGet) this.inFlightRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  get(endpoint, params = {}, options = {}) {
    return this.request(endpoint, { method: 'GET', params, ...options });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : null, ...options });
  }

  put(endpoint, data, params = {}, options = {}) {
    return this.request(endpoint, { method: 'PUT', body: data ? JSON.stringify(data) : null, params, ...options });
  }

  patch(endpoint, data, params = {}, options = {}) {
    return this.request(endpoint, { method: 'PATCH', body: data ? JSON.stringify(data) : null, params, ...options });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  /**
   * Invalidate cache for a specific endpoint prefix or all cache
   */
  invalidateCache(endpointPrefix = null) {
    if (endpointPrefix) {
      const prefix = endpointPrefix.split('?')[0];
      for (const key of this.cache.keys()) {
        if (key.includes(prefix)) {
          this.cache.delete(key);
          this.cacheExpiry.delete(key);
          // Also remove from storage
          try {
            localStorage.removeItem(PERSISTENT_PREFIX + btoa(key));
          } catch (e) { }
        }
      }
    } else {
      this.clearCache();
    }
  }
}

export const apiService = new ApiService();
export default apiService;
