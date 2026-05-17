import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { RequestProvider } from './contexts/RequestContext';
import { Toaster } from '@/components/ui/sonner';
import GlobalErrorManager from './components/GlobalErrorManager';
import ResponsiveLayout from './components/layout/ResponsiveLayout';

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
const StudentDiscovery = lazy(() => import('./components/discovery/StudentDiscovery'));
const ProjectDiscovery = lazy(() => import('./components/discovery/ProjectDiscovery'));
const RequestsPage = lazy(() => import('./components/requests/RequestsPage'));
const SkillMastery = lazy(() => import('./components/profile/SkillMastery'));
const EventsPage = lazy(() => import('./components/events/EventsPage'));
const OAuth2RedirectHandler = lazy(() => import('./components/auth/OAuth2RedirectHandler'));
const NotFound = lazy(() => import('./components/common/NotFound'));

// FIXED: This loader is now strictly light mode and won't cause a black flash
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
      <AuthProvider>
        <RequestProvider>
          {/* Main Suspense for the entire app */}
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

              {/* Protected Routes - Layout is STATIC and will NOT unmount */}
              <Route element={<ProtectedRoute><ResponsiveLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects/my-projects" element={<MyProjects />} />
                <Route path="/projects/create" element={<CreateProject />} />
                <Route path="/projects/:id" element={<ProjectPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/skills" element={<SkillMastery />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/messages" element={<RequestsPage />} />
                <Route path="/discover/projects" element={<ProjectDiscovery />} />
                <Route path="/discover/students" element={<StudentDiscovery />} />
                <Route path="/events" element={<EventsPage />} />
              </Route>

              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
          <GlobalErrorManager />
        </RequestProvider>
      </AuthProvider>
    </Router>
  );
}