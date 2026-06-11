import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, ShieldCheck, Github } from 'lucide-react';
import apiService from '../../services/api';
import { motion } from 'framer-motion';

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentUser, setUserProfile } = useAuth();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) throw new Error('Token Missing');

        localStorage.setItem('token', token);
        apiService.setToken(token);

        const resp = await apiService.get('/auth/me');
        const user = resp?.data?.data || resp?.data || resp;

        setCurrentUser(user);
        setUserProfile(user);
        setStatus('success');

        const hasCollege = user.collegeId || (user.college && user.college.id);
        const intent = localStorage.getItem('oauth_intent');

        setTimeout(() => {
          if (intent === 'register' && !hasCollege) navigate('/complete-profile');
          else if (intent === 'register') navigate('/onboarding');
          else navigate('/dashboard');
        }, 1500);

      } catch (err) {
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    handleRedirect();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        {status === 'loading' ? (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Github size={32} className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Connecting GitHub</h1>
              <p className="text-slate-500 text-sm">Please wait while we secure your connection...</p>
            </div>
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Identity Verified</h1>
              <p className="text-slate-500 text-sm">Welcome back. Redirecting to workspace...</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}