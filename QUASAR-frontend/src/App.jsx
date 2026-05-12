import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { RequestProvider } from './contexts/RequestContext';
import AdminRoute from './components/admin/AdminRoute';
import MentorRoute from './components/mentor/MentorRoute';
import { Toaster } from '@/components/ui/sonner';
import GlobalErrorManager from './components/GlobalErrorManager';


// --- Lazy Imports (Ensuring all auth paths are present) ---
const LandingPage = lazy(() => import('./components/LandingPage'));
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const CompleteProfile = lazy(() => import('./components/auth/CompleteProfile'));
const Onboarding = lazy(() => import('./components/auth/Onboarding'));
const MessagesPage = lazy(() => import('./components/requests/RequestsPage'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const MyProjects = lazy(() => import('./components/projects/MyProjects'));
const CreateProject = lazy(() => import('./components/projects/CreateProject'));
const ProfilePage = lazy(() => import('./components/profile/ProfilePage'));
const ProjectPage = lazy(() => import('./components/project/ProjectPage'));
const StudentDiscovery = lazy(() => import('./components/discovery/StudentDiscovery'));
const ProjectDiscovery = lazy(() => import('./components/discovery/ProjectDiscovery'));
const RequestsPage = lazy(() => import('./components/requests/RequestsPage'));
const TechStack = lazy(() => import('./components/profile/SkillMastery'));
const EventsPage = lazy(() => import('./components/events/EventsPage'));
const OAuth2RedirectHandler = lazy(() => import('./components/auth/OAuth2RedirectHandler'));
const NotFound = lazy(() => import('./components/common/NotFound'));

// Professional Skeleton Loader
function PageLoader() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0F1115]">
      <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Synchronizing Identity...</p>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            {/* Public Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/oauth2/redirect" element={<OAuth2RedirectHandler />} />

            {/* Post-Auth Onboarding Routes */}
            <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

            {/* Core Application Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
            <Route path="/discover/students" element={<ProtectedRoute><StudentDiscovery /></ProtectedRoute>} />
            <Route path="/discover/projects" element={<ProtectedRoute><ProjectDiscovery /></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
            <Route path="/projects/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute><TechStack /></ProtectedRoute>} />
            <Route path="/projects/my-projects" element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />

            {/* 404 Handling */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <RequestProvider>
          <div className="relative min-h-screen bg-slate-50 dark:bg-[#0F1115]">
            <main className="w-full">
              <AnimatedRoutes />
            </main>

            <GlobalErrorManager />
            <Toaster richColors position="bottom-right" closeButton />
          </div>
        </RequestProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;