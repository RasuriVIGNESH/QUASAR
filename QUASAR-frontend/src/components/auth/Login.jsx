import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Activity, Loader2, Github, ChevronLeft, ShieldCheck } from 'lucide-react';
import { toast } from "sonner";
import ValidationAlert from '@/components/common/ValidationAlert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login, loginWithGitHub } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const user = await login(email, password);
      setShowWelcome(true);
      setTimeout(() => {
        if (user?.role === 'ADMIN') navigate('/admin/overview');
        else if (user?.role === 'MENTOR') navigate('/mentor/overview');
        else navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err);
      if (!err.data?.validationErrors) toast.error(err.message || 'Invalid credentials');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white font-sans antialiased">
      {/* --- LEFT: BRANDING PANE (Matches Landing Hero) --- */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <img
            src="/Logo.png"
            alt="Quasar Logo"
            className="w-10 h-10 object-contain shadow-sm rounded-lg"
          />
          <span className="text-xl font-bold tracking-tight text-white">Quasar</span>
        </Link>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="text-6xl font-bold tracking-tighter leading-[1.1] text-white mb-6">
              Welcome back to <br /><span className="text-slate-400">the workspace.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              Sign in to manage your projects, find teammates, and track your verified contributions.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Network Secure</span>
          </div>
          <span>•</span>
          <span>v2.0.4 rdy</span>
        </div>
      </div>

      {/* --- RIGHT: FORM PANE --- */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-24 relative bg-white">
        <div className="w-full max-w-sm space-y-8 relative z-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign In</h2>
            <p className="text-slate-500 text-sm">Enter your university credentials to continue.</p>
          </div>

          <ValidationAlert error={error} />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">University Email</Label>
              <Input
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-slate-50 border-slate-200 rounded-lg focus:ring-slate-900 text-slate-900"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-slate-700">Password</Label>
                <Link to="/forgot-password" px-4 py-2 className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">Forgot password?</Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-slate-50 border-slate-200 rounded-lg focus:ring-slate-900 text-slate-900"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span></div>
          </div>

          <Button
            onClick={() => loginWithGitHub()}
            variant="outline"
            className="w-full h-12 border border-slate-300 bg-white rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors text-slate-900"
          >
            <Github size={18} className="text-slate-900" />
            <span className="text-slate-900">Sign in with GitHub</span>
          </Button>

          <p className="text-center text-sm text-slate-500">
            Don't have an account? <Link to="/register" className="text-slate-900 font-bold hover:underline ml-1">Create one</Link>
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showWelcome && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <ShieldCheck size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Identity Verified</h1>
              <p className="text-slate-500 mt-2">Redirecting to your dashboard...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}