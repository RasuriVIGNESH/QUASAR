import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import apiService from '../../services/api';

// GitHub Icon Component
const GitHubIcon = ({ className = "h-12 w-12" }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentUser, setUserProfile } = useAuth();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!token) {
          setStatus('error');
          setMessage('No authentication token received');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        localStorage.setItem('token', token);
        apiService.setToken(token);

        const resp = await apiService.get('/auth/me');
        const payload = resp?.data || resp;
        const user = payload?.data || payload;

        if (!user) {
          throw new Error('Failed to retrieve user profile after authentication');
        }

        if (user.profilePictureUrl) {
          user.profileImage = user.profilePictureUrl;
        } else if (user.profilePhoto) {
          const photoData = user.profilePhoto;
          const photoUrl = photoData.startsWith('data:image')
            ? photoData
            : `data:image/png;base64,${photoData}`;
          user.profileImage = photoUrl;
          user.profilePictureUrl = photoUrl;
        }

        setCurrentUser(user);
        setUserProfile(user);

        setStatus('success');
        setMessage('Successfully authenticated with GitHub!');

        const hasCollege = user.collegeId || (user.college && user.college.id);
        const oauthIntent = localStorage.getItem('oauth_intent');

        if (oauthIntent === 'register' && !hasCollege) {
          setMessage('Please complete your profile details...');
          setTimeout(() => navigate('/complete-profile'), 1200);
        } else if (oauthIntent === 'register') {
          setTimeout(() => navigate('/onboarding'), 1200);
        } else {
          setTimeout(() => navigate('/dashboard'), 1200);
        }
      } catch (err) {
        console.error('OAuth2 redirect error:', err);
        setStatus('error');
        setMessage(err?.message || 'An error occurred during authentication');
        localStorage.removeItem('token');
        apiService.setToken(null);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleRedirect();
  }, [searchParams, navigate, setCurrentUser, setUserProfile]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-violet-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto px-4 text-center">
        {/* Animated Logo Container */}
        <div className="mb-8 relative">
          {status === 'loading' && (
            <>
              {/* Spinning Ring */}
              <div className="absolute inset-0 -m-4 rounded-full border-[3px] border-slate-200 border-t-slate-800 animate-spin" style={{ animationDuration: '1.5s' }} />

              {/* Pulse Effect */}
              <div className="absolute inset-0 bg-slate-200/50 rounded-full animate-ping opacity-20" />

              <div className="relative bg-slate-900 rounded-full p-6 shadow-2xl ring-4 ring-white">
                <GitHubIcon className="h-16 w-16 text-white" />
              </div>
            </>
          )}

          {status === 'success' && (
            <div className="relative animate-bounce-subtle">
              <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-2xl" />
              <div className="relative bg-[#2ea44f] rounded-full p-6 shadow-2xl ring-4 ring-white transform transition-all duration-500 scale-110">
                <CheckCircle className="h-16 w-16 text-white" strokeWidth={2.5} />
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="relative">
              <div className="absolute inset-0 bg-red-400/30 rounded-full blur-2xl" />
              <div className="relative bg-red-500 rounded-full p-6 shadow-2xl ring-4 ring-white">
                <XCircle className="h-16 w-16 text-white" strokeWidth={2.5} />
              </div>
            </div>
          )}
        </div>

        {/* Text Status */}
        <div className="space-y-3">
          <h2 className={`text-2xl font-bold tracking-tight transition-all duration-300 ${status === 'error' ? 'text-red-600' :
              status === 'success' ? 'text-emerald-700' : 'text-slate-900'
            }`}>
            {status === 'loading' && 'Connecting to GitHub...'}
            {status === 'success' && 'Successfully Connected!'}
            {status === 'error' && 'Connection Failed'}
          </h2>

          <p className="text-slate-500 font-medium text-lg max-w-xs mx-auto leading-relaxed">
            {status === 'loading' && (
              <span className="animate-pulse">Verifying your credentials secure connection</span>
            )}
            {status === 'success' && 'Redirecting you to the platform...'}
            {status === 'error' && message}
          </p>

          {/* Loading Dots */}
          {status === 'loading' && (
            <div className="flex gap-2 justify-center mt-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-slate-800/50"
                  style={{
                    animation: `pulse 1s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}