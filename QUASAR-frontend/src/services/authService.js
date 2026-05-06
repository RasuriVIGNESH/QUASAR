import apiService from './api.js';

class AuthService {

    // Register
    async register(userData) {

        try {

            const response = await apiService.post(
                '/auth/register',
                userData,
                {
                    includeAuth: false
                }
            );

            // Backend returns wrapped response
            if (response.data?.accessToken) {

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

            throw new Error(
                error.message || 'Registration failed'
            );
        }
    }

    // Login
    async login(email, password) {

        try {

            const response = await apiService.post(
                '/auth/login',
                {
                    email,
                    password
                },
                {
                    includeAuth: false
                }
            );

            if (response.data?.accessToken) {

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

            throw new Error(
                error.message || 'Login failed'
            );
        }
    }

    // LinkedIn OAuth
    async loginWithLinkedIn() {

        try {

            const linkedInAuthUrl =
                `http://localhost:8080/oauth2/authorize/linkedin`;

            window.location.href = linkedInAuthUrl;

        } catch (error) {

            throw new Error('LinkedIn authentication failed');
        }
    }

    // GitHub OAuth
    async loginWithGitHub() {

        try {

            const response = await apiService.get('/auth/github');

            if (response?.data) {

                const redirectPath = response.data;

                let origin;

                try {

                    const url = new URL(apiService.baseURL);

                    origin = url.origin;

                } catch {

                    origin = window.location.origin;
                }

                if (redirectPath.startsWith('http')) {

                    window.location.href = redirectPath;

                } else {

                    const cleanOrigin = origin.replace(/\/$/, '');

                    const cleanPath = redirectPath.startsWith('/')
                        ? redirectPath
                        : `/${redirectPath}`;

                    window.location.href =
                        `${cleanOrigin}${cleanPath}`;
                }

            } else {

                throw new Error('Invalid server response');
            }

        } catch (error) {

            console.error('GitHub authentication error:', error);

            throw new Error('GitHub authentication failed');
        }
    }

    // Logout
    async logout() {

        try {

            await apiService.post('/auth/logout');

        } catch (error) {

            console.error('Logout error:', error);

        } finally {

            apiService.clearSession();
        }
    }

    // Current user
    async getCurrentUser() {

        try {

            const response =
                await apiService.get('/auth/me');

            return response.data
                ? response.data
                : response;

        } catch (error) {

            throw new Error(
                error.message || 'Failed to get user profile'
            );
        }
    }

    // Forgot password
    async forgotPassword(email) {

        try {

            return await apiService.post(
                '/auth/forgot-password',
                { email },
                {
                    includeAuth: false
                }
            );

        } catch (error) {

            throw new Error(
                error.message || 'Failed to send reset email'
            );
        }
    }

    // Reset password
    async resetPassword(token, newPassword) {

        try {

            return await apiService.post(
                '/auth/reset-password',
                {
                    token,
                    password: newPassword
                },
                {
                    includeAuth: false
                }
            );

        } catch (error) {

            throw new Error(
                error.message || 'Failed to reset password'
            );
        }
    }

    // Auth check
    isAuthenticated() {

        return !!apiService.getToken();
    }

    // Get token
    getToken() {

        return apiService.getToken();
    }
}

export const authService = new AuthService();

export default authService;