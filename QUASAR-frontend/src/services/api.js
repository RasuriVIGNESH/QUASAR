// src/services/api.js

import { API_CONFIG } from '../config/api.js';

class ApiService {

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.onError = null;
  }

  // Set global error handler
  setOnError(handler) {
    this.onError = handler;
  }

  // Store JWT token
  setToken(token) {

    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Get JWT token
  getToken() {
    return localStorage.getItem('token');
  }

  // Clear auth session
  clearSession() {

    localStorage.removeItem('token');

    // Add more storage cleanup here if needed
    // localStorage.removeItem('user');
  }

  // Build headers
  getHeaders(includeAuth = true) {

    const headers = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();

    if (includeAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Redirect to login
  redirectToLogin() {

    if (typeof window !== 'undefined') {

      // Prevent redirect loop
      if (window.location.pathname !== '/login') {

        alert('Session expired. Please login again.');

        window.location.href = '/login';
      }
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {

    let url = `${this.baseURL}${endpoint}`;

    // Query params
    if (options.params) {

      const query = new URLSearchParams(options.params).toString();

      if (query) {
        url += `?${query}`;
      }
    }

    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    delete config.params;

    try {

      const response = await fetch(url, config);

      // Handle empty response
      if (
        response.status === 204 ||
        !response.headers.get('content-type')?.includes('application/json')
      ) {

        if (response.ok) {
          return response.text();
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle failed response
      if (!response.ok) {

        const error = new Error(
          data.message || `HTTP error! status: ${response.status}`
        );

        error.data = data;
        error.status = response.status;

        // JWT expired / unauthorized
        if (response.status === 401) {

          console.warn('JWT expired or invalid');

          this.clearSession();

          if (options.preventRedirect !== true) {
            this.redirectToLogin();
          }
        }

        throw error;
      }

      return data;

    } catch (error) {

      console.error('API request failed:', url, error);

      // Global server error handler
      if (
        this.onError &&
        (
          error.status === 500 ||
          error.message?.includes('Internal Server Error')
        )
      ) {
        this.onError(error);
      }

      throw error;
    }
  }

  // GET
  async get(endpoint, params = {}, options = {}) {

    return this.request(endpoint, {
      method: 'GET',
      params,
      ...options,
    });
  }

  // POST
  async post(endpoint, data, options = {}) {

    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  // PUT
  async put(endpoint, data, params = {}, options = {}) {

    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      params,
      ...options,
    });
  }

  // DELETE
  async delete(endpoint, options = {}) {

    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }
}

export const apiService = new ApiService();
export default apiService;