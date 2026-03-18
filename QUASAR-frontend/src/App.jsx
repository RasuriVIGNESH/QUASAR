import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Added Framer Motion
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { RequestProvider } from './contexts/RequestContext';
import AdminRoute from './components/admin/AdminRoute';
import MentorRoute from './components/mentor/MentorRoute';
import { Toaster } from '@/components/ui/sonner';
import AnimatedBackground from './components/common/AnimatedBackground';
import GlobalErrorManager from './components/GlobalErrorManager';

// ✅ Lazy Imports
const LandingPage = lazy(() => import('./components/LandingPage'));
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const CompleteProfile = lazy(() => import('./components/auth/CompleteProfile'));
const Onboarding = lazy(() => import('./components/auth/Onboarding'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ProfilePage = lazy(() => import('./components/profile/ProfilePage'));
const CreateProject = lazy(() => import('./components/projects/CreateProject'));
const ProjectPage = lazy(() => import('./components/project/ProjectPage'));
const InviteMembers = lazy(() => import('./components/project/InviteMembers'));
const StudentDiscovery = lazy(() => import('./components/discovery/StudentDiscovery'));
const ProjectDiscovery = lazy(() => import('./components/discovery/ProjectDiscovery'));
const SkillDiscovery = lazy(() => import('./components/discovery/SkillDiscovery'));
const RecommendedProjectsPage = lazy(() => import('./components/discovery/RecommendedProjectsPage'));
const MyProjects = lazy(() => import('./components/projects/MyProjects'));
const OAuth2RedirectHandler = lazy(() => import('./components/auth/OAuth2RedirectHandler'));
const RequestsPage = lazy(() => import('./components/requests/RequestsPage'));
const EventsPage = lazy(() => import('./components/events/EventsPage'));
const EventDetailPage = lazy(() => import('./components/events/EventDetailPage'));
const AdminDashboardLayout = lazy(() => import('./components/admin/AdminDashboardLayout'));
const AdminOverview = lazy(() => import('./components/admin/AdminOverview'));
const AdminEvents = lazy(() => import('./components/admin/AdminEvents'));
const AdminEventDetails = lazy(() => import('./components/admin/AdminEventDetails'));
const AdminUsers = lazy(() => import('./components/admin/AdminUsers'));
const AdminProjects = lazy(() => import('./components/admin/AdminProjects'));
const AdminMentors = lazy(() => import('./components/admin/AdminMentors'));
const MentorDashboardLayout = lazy(() => import('./components/mentor/MentorDashboardLayout'));
const MentorOverview = lazy(() => import('./components/mentor/MentorOverview'));
const MentorStudents = lazy(() => import('./components/mentor/MentorStudents'));
const MentorProjects = lazy(() => import('./components/mentor/MentorProjects'));
const MeetingRoomsPage = lazy(() => import('./components/project/MeetingRoomsPage'));
const SkillMastery = lazy(() => import('./components/profile/SkillMastery'));
const ServerError = lazy(() => import('./components/common/ServerError'));
const NotFound = lazy(() => import('./components/common/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}

// --- NEW ANIMATED ROUTE WRAPPER (Fix 7) ---
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/oauth2/redirect" element={<OAuth2RedirectHandler />} />

            {/* Protected Routes */}
            <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/projects/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
            <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
            <Route path="/projects/:projectId/invite" element={<ProtectedRoute><InviteMembers /></ProtectedRoute>} />
            <Route path="/projects/:projectId/rooms" element={<ProtectedRoute><MeetingRoomsPage /></ProtectedRoute>} />

            {/* Discovery Routes */}
            <Route path="/discover/students" element={<ProtectedRoute><StudentDiscovery /></ProtectedRoute>} />
            <Route path="/discover/projects" element={<ProtectedRoute><ProjectDiscovery /></ProtectedRoute>} />
            <Route path="/discover/skills" element={<ProtectedRoute><SkillDiscovery /></ProtectedRoute>} />
            <Route path="/discover/recommendations" element={<ProtectedRoute><RecommendedProjectsPage /></ProtectedRoute>} />

            <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
            <Route path="/projects/my-projects" element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />

            {/* Admin Section */}
            <Route path="/admin" element={<AdminRoute><AdminDashboardLayout /></AdminRoute>}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AdminOverview />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="events/:eventId" element={<AdminEventDetails />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="mentors" element={<AdminMentors />} />
            </Route>

            {/* Mentor Section */}
            <Route path="/mentor" element={<MentorRoute><MentorDashboardLayout /></MentorRoute>}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<MentorOverview />} />
              <Route path="students" element={<MentorStudents />} />
              <Route path="projects" element={<MentorProjects />} />
            </Route>

            <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
            <Route path="/events/:eventId" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute><SkillMastery /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

            {/* Error Handling */}
            <Route path="/server-error" element={<ServerError />} />
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
          <div className="App" style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Background is outside navigation to avoid flickering */}
            <AnimatedBackground />

            {/* Navigation and Content with Transitions */}
            <AnimatedRoutes />

            {/* Global UI Overlays */}
            <GlobalErrorManager />
            <Toaster richColors position="top-center" closeButton />
          </div>
        </RequestProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;