import apiService from './api.js';


class AuthService {
    // Register new user
    async register(userData) {
        try {
            const response = await apiService.post('/auth/register', userData, {
                includeAuth: false
            });

            // Extract from the wrapped response structure
            if (response.data && response.data.accessToken) {
                apiService.setToken(response.data.accessToken);
                return {
                    token: response.data.accessToken,
                    accessToken: response.data.accessToken,
                    user: response.data.user,
                    ...response.data
                };
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    // Login user
    async login(email, password) {
        try {
            const response = await apiService.post('/auth/login', {
                email,
                password
            }, {
                includeAuth: false
            });

            // Extract from the wrapped response structure  
            if (response.data && response.data.accessToken) {
                apiService.setToken(response.data.accessToken);
                return {
                    token: response.data.accessToken,
                    accessToken: response.data.accessToken,
                    user: response.data.user,
                    ...response.data
                };
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    // LinkedIn OAuth login
    async loginWithLinkedIn() {
        try {
            // Redirect directly to Spring Boot's OAuth2 authorization endpoint
            const linkedInAuthUrl = `http://localhost:8080/oauth2/authorize/linkedin`;
            window.location.href = linkedInAuthUrl;
        } catch (error) {
            throw new Error('LinkedIn authentication failed');
        }
    }

    async loginWithGitHub() {
        try {
            // First get the redirect URL from the backend
            const response = await apiService.get('/auth/github');

            if (response && response.data) {
                const redirectPath = response.data;

                // Determine the base origin for the redirect
                let origin;
                try {
                    // Try to get origin from configured BASE_URL
                    const url = new URL(apiService.baseURL);
                    origin = url.origin;
                } catch (e) {
                    // If BASE_URL is relative or invalid, use current window origin (proxy scenario)
                    origin = window.location.origin;
                }

                // Construct full URL
                // Check if response.data is already absolute
                if (redirectPath.startsWith('http')) {
                    window.location.href = redirectPath;
                } else {
                    // Combine origin and path, avoiding double slashes or missing slashes
                    const cleanOrigin = origin.replace(/\/$/, '');
                    const cleanPath = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`;
                    window.location.href = `${cleanOrigin}${cleanPath}`;
                }
            } else {
                console.error('Invalid GitHub login response:', response);
                throw new Error('Invalid server response');
            }
        } catch (error) {
            console.error('GitHub authentication error:', error);
            throw new Error('GitHub authentication failed');
        }
    }



    // Logout user
    async logout() {
        try {
            await apiService.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            apiService.setToken(null);
        }
    }

    // Get current user profile
    async getCurrentUser() {
        try {
            const response = await apiService.get('/auth/me');
            // Handle wrapped response for getCurrentUser too
            return response.data ? response.data : response;
        } catch (error) {
            throw new Error(error.message || 'Failed to get user profile');
        }
    }

    // Forgot password
    async forgotPassword(email) {
        try {
            return await apiService.post('/auth/forgot-password', { email }, {
                includeAuth: false
            });
        } catch (error) {
            throw new Error(error.message || 'Failed to send reset email');
        }
    }

    // Reset password
    async resetPassword(token, newPassword) {
        try {
            return await apiService.post('/auth/reset-password', {
                token,
                password: newPassword
            }, {
                includeAuth: false
            });
        } catch (error) {
            throw new Error(error.message || 'Failed to reset password');
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!apiService.getToken();
    }

    // Get stored token
    getToken() {
        return apiService.getToken();
    }
}

export const authService = new AuthService();
export default authService;
