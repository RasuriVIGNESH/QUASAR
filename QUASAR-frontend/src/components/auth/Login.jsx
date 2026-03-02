// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, Github } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { toast } from "sonner";
import ValidationAlert from '@/components/common/ValidationAlert';
import MagneticButton from '@/components/common/MagneticButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      await login(email, password);
      setShowWelcome(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Login error:', err);
      setError(err);
      if (!err.data?.validationErrors) {
        toast.error(err.message || 'Invalid credentials', { duration: 2000 });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGitHubLogin() {
    try {
      setLoading(true);
      localStorage.setItem('oauth_intent', 'login');
      await loginWithGitHub();
    } catch (err) {
      console.error('GitHub login error:', err);
      toast.error('GitHub login failed. Please try again.', { duration: 2000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden relative" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>
      {/* Animated Background */}
      {/* Background handled by global AnimatedBackground */}

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
              <img src="/data/Logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
              <span className="text-2xl font-bold" style={{ color: 'var(--text-bright)' }}>Quasar</span>
            </Link>
            <h2 className="mt-6 text-4xl font-black" style={{ color: 'var(--text-bright)' }}>
              Welcome back
            </h2>
            <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
              Sign in to continue your journey
            </p>
          </div>

          {/* Form Card */}
          <div>
            <Card className="border-0 glass-surface" style={{ boxShadow: 'var(--shadow-float)' }}>
              <CardContent className="p-8">
                <ValidationAlert error={error} />
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-12 rounded-xl input-focus-glow"
                        style={{ background: 'var(--surface-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-12 rounded-xl input-focus-glow"
                        style={{ background: 'var(--surface-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                        required
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </motion.button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm font-semibold transition-colors hover-spring" style={{ color: 'var(--indigo-primary)' }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-12 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 hover-spring"
                        style={{ background: 'linear-gradient(135deg, var(--indigo-primary), var(--violet))', boxShadow: 'var(--shadow-button)' }}
                        disabled={loading}
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 text-sm font-medium" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>Or continue with</span>
                  </div>
                </div>

                {/* GitHub Button */}
                <div>
                  <div className="group relative">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full relative overflow-hidden rounded-xl bg-[#24292e] text-white p-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:bg-[#2f363d] transition-all duration-300"
                      onClick={handleGitHubLogin}
                      disabled={loading}
                    >
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{
                          duration: 2,
                          ease: "easeInOut",
                          times: [0, 0.2, 0.5, 0.8, 1],
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                        className="flex items-center justify-center"
                      >
                        <Github className="h-6 w-6" />
                      </motion.div>
                      <span className="font-bold text-base tracking-wide">
                        {loading ? 'Connecting...' : 'Continue with GitHub'}
                      </span>

                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                    </motion.button>
                  </div>
                </div>

                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      {/* Welcome Animation Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl mx-auto mb-6 shadow-2xl flex items-center justify-center p-2 border border-slate-100 dark:border-slate-800">
                <img src="/data/Logo.png" alt="Quasar Logo" className="w-full h-full object-cover rounded-2xl" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-bright)' }}>
                Welcome back
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">Taking you to your dashboard...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}