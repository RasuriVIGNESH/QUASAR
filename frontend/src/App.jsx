import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { RequestProvider } from './contexts/RequestContext';
import { Toaster } from '@/components/ui/sonner';
import GlobalErrorManager from './components/GlobalErrorManager';
import ResponsiveLayout from './components/layout/ResponsiveLayout';
import { apiService } from '@/services/api';

// Lazy Imports
const LandingPage = lazy(() => import('./components/LandingPage'));
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const CompleteProfile = lazy(() => import('./components/auth/CompleteProfile'));
const Onboarding = lazy(() => import('./components/auth/Onboarding'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const EventDetails = lazy(() => import('./components/events/EventDetails'));
const MyProjects = lazy(() => import('./components/projects/MyProjects'));
const CreateProject = lazy(() => import('./components/projects/CreateProject'));
const ProfilePage = lazy(() => import('./components/profile/ProfilePage'));
const ProjectPage = lazy(() => import('./components/project/ProjectPage'));
const InviteMembers = lazy(() => import('./components/project/InviteMembers'));
const StudentDiscovery = lazy(() => import('./components/discovery/StudentDiscovery'));
const ProjectDiscovery = lazy(() => import('./components/discovery/ProjectDiscovery'));
const RequestsPage = lazy(() => import('./components/requests/RequestsPage'));
const SkillMastery = lazy(() => import('./components/profile/SkillMastery'));
const EventsPage = lazy(() => import('./components/events/EventsPage'));
const OAuth2RedirectHandler = lazy(() => import('./components/auth/OAuth2RedirectHandler'));

/**
 * NavigationRegistrar
 * Small component to bridge React Router navigate with our static ApiService
 */
function NavigationRegistrar() {
  const navigate = useNavigate();

  useEffect(() => {
    apiService.setNavigate(navigate);
  }, [navigate]);

  return null;
}

export function PageLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC] min-h-[200px]">
      <div className="w-8 h-8 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <NavigationRegistrar />
      <AuthProvider>
        <RequestProvider>
          <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/auth/oauth2/redirect" element={<OAuth2RedirectHandler />} />

              {/* Protected Routes */}
              <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
              <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
              <Route path="/projects/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
              <Route path="/projects/:projectId/invite" element={<ProtectedRoute><InviteMembers /></ProtectedRoute>} />

              <Route element={<ProtectedRoute><ResponsiveLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects/my-projects" element={<MyProjects />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/skills" element={<SkillMastery />} />
                <Route path="/messages" element={<RequestsPage />} />
                <Route path="/discover/projects" element={<ProjectDiscovery />} />
                <Route path="/discover/students" element={<StudentDiscovery />} />
                <Route path="/events" element={<EventsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          <Toaster
            position="top-right"
            richColors
            closeButton
            expand={true}
          />

          <GlobalErrorManager />
        </RequestProvider>
      </AuthProvider>
    </Router>
  );
}
