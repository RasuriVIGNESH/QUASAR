import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useRequests } from '../contexts/RequestContext';
import { dashboardService } from '../services/dashboardService';
import dataService from '../services/dataService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, FolderOpen, TrendingUp, LogOut, Plus, Menu, User, Mail,
  Search, ArrowRight, Bell, Clock, CheckCircle, Star, GitBranch,
  ChevronRight, Calendar, Sun, Moon, Code, Settings
} from 'lucide-react';
import ProjectDetailModal from './discovery/ProjectDetailModal';
import MagneticButton from './common/MagneticButton';
import TiltCard from './common/TiltCard';
import ShootingStarsCanvas from './common/ShootingStarsCanvas'; // Restored

// --- STATIC DATA MOVED OUTSIDE COMPONENT (Memory Optimization) ---
const RECENT_ACTIVITIES = [
  {
    title: "New connection request",
    user: "Sarah Chen",
    time: "2 hours ago",
    icon: <Users className="h-4 w-4" />,
    color: "bg-blue-500",
    path: '/requests'
  },
  {
    title: "Project milestone completed",
    user: "AI Learning Platform",
    time: "5 hours ago",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-emerald-600",
    path: '/projects/my-projects'
  },
  {
    title: "New skill endorsed",
    user: "React Development",
    time: "1 day ago",
    icon: <Star className="h-4 w-4" />,
    color: "bg-amber-500",
    path: '/skills'
  }
];

const TRENDING_SKILLS = [
  { name: "React.js", count: 234, trend: "+12%", icon: <Code className="h-4 w-4" /> },
  { name: "Python", count: 189, trend: "+8%", icon: <Code className="h-4 w-4" /> },
  { name: "TypeScript", count: 156, trend: "+15%", icon: <Code className="h-4 w-4" /> },
  { name: "Machine Learning", count: 142, trend: "+20%", icon: <Code className="h-4 w-4" /> },
  { name: "Docker", count: 128, trend: "+10%", icon: <Code className="h-4 w-4" /> }
];

const EMPTY_MSGS = [
  "Ready to start your journey? Create your first project today!",
  "Your portfolio is a blank canvas. Start painting!",
  "Great things start with a single project.",
  "The world is waiting for your ideas. Launch one!",
  "Every expert was once a beginner. Start building."
];

const ScrollSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default function Dashboard() {
  const { userProfile, logout } = useAuth();
  const { pendingCount } = useRequests();
  const navigate = useNavigate();

  const [projectCount, setProjectCount] = useState(0);
  const [skillCount, setSkillCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Stable random index for welcome message (Fix 6)
  const msgIdxRef = useRef(Math.floor(Math.random() * 5));

  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    if (userProfile?.role === 'ADMIN') navigate('/admin/overview', { replace: true });
    if (userProfile?.role === 'MENTOR') navigate('/mentor/overview', { replace: true });
  }, [userProfile, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userProfile) return;
      try {
        const [countRes, recRes, eventRes] = await Promise.allSettled([
          dashboardService.getDashboardCounts(),
          dataService.getTopRecommendedProjects(userProfile.id, 3),
          dataService.getUpcomingEvents()
        ]);

        if (countRes.status === 'fulfilled' && countRes.value.success) {
          setProjectCount(countRes.value.data.projectsCount || 0);
          setSkillCount(countRes.value.data.skillsCount || 0);
        }

        if (recRes.status === 'fulfilled' && recRes.value?.recommendedProjects) {
          setRecommendedProjects(recRes.value.recommendedProjects.map(p => ({
            ...p, id: p.projectId, members: p.members || 1, skills: p.skills || []
          })));
        }

        if (eventRes.status === 'fulfilled') {
          setUpcomingEvents(Array.isArray(eventRes.value) ? eventRes.value : (eventRes.value?.data || []));
        }
      } catch (error) {
        console.error('Dashboard Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [userProfile]);

  const welcomeMessage = useMemo(() => {
    const count = parseInt(projectCount) || 0;
    const connections = userProfile?.connectionCount || 0;
    if (count === 0) return <span className="italic text-slate-500">{EMPTY_MSGS[msgIdxRef.current % EMPTY_MSGS.length]}</span>;

    const ACTIVE_MSGS = [
      <>You're building momentum! Managing <span className="text-blue-600 font-bold">{count} projects</span>.</>,
      <>Great progress! You have <span className="text-blue-600 font-bold">{count} active projects</span> underway.</>,
      <>Innovation in action. You're leading <span className="text-blue-600 font-bold">{count} exciting initiatives</span>.</>
    ];
    return ACTIVE_MSGS[msgIdxRef.current % ACTIVE_MSGS.length];
  }, [projectCount, userProfile]);

  return (
    <div className="min-h-screen qx-root bg-[#03050d] text-[var(--text-primary)] relative">
      {/* RESTORED: Shooting Stars + Nebula Effect */}
      <ShootingStarsCanvas />
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-18%] left-[-12%] w-[60%] h-[55%] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-12%] right-[-10%] w-[50%] h-[45%] bg-cyan-500/5 rounded-full blur-[90px]" />
        <div className="absolute top-[38%] left-[25%] w-[40%] h-[32%] bg-orange-500/5 rounded-full blur-[80px]" />
      </div>

      <motion.header style={{ opacity: headerOpacity }} className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl">
        <div className="glass-header rounded-2xl px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/Logo.png" alt="Quasar" className="w-10 h-10 rounded-xl" loading="lazy" />
              <span className="text-xl font-bold text-gradient-indigo">Quasar</span>
            </div>
            <div className="flex items-center gap-3 relative" ref={menuRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 rounded-xl glass-surface transition-colors ${showMenu ? 'bg-white/10 border-[var(--indigo-primary)]' : ''}`}
              >
                <Menu className="h-5 w-5 text-[var(--text-secondary)]" />
              </motion.button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(10px)' }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-3 w-64 glass-surface border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden z-[60]"
                  >
                    <div className="p-3 border-b border-[var(--border-subtle)] bg-white/5">
                      <div className="flex items-center gap-3 px-2 py-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--indigo-primary)] to-[var(--violet)] flex items-center justify-center text-white font-bold">
                          {userProfile?.firstName?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[var(--text-bright)] truncate max-w-[140px]">
                            {userProfile?.firstName} {userProfile?.lastName}
                          </span>
                          <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-black">
                            {userProfile?.role || 'STUDENT'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => { navigate('/profile'); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                      >
                        <User className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-[var(--indigo-primary)] transition-colors" />
                        <span className="font-medium text-sm">View Profile</span>
                      </button>

                      <button
                        onClick={() => { navigate('/requests'); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left group relative"
                      >
                        <Mail className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-[var(--indigo-primary)] transition-colors" />
                        <span className="font-medium text-sm">Messages</span>
                        {pendingCount > 0 && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-[var(--indigo-primary)] text-[10px] font-bold text-white rounded-lg flex items-center justify-center shadow-lg">
                            {pendingCount}
                          </span>
                        )}
                      </button>

                      <div className="h-px bg-[var(--border-subtle)] mx-2 my-1" />

                      <button
                        onClick={() => { setShowLogoutConfirm(true); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors text-left group"
                      >
                        <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        <motion.section style={{ scale: heroScale }} className="mb-20">
          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight text-[var(--text-bright)]">
            Welcome back, <span className="text-gradient-indigo">{userProfile?.firstName || 'Creator'}</span>
          </h1>
          <div className="text-lg md:text-xl font-medium text-[var(--text-secondary)] mb-8">
            {loading ? <Skeleton className="h-7 w-3/4 bg-white/5" /> : welcomeMessage}
          </div>

          <div className="flex flex-wrap gap-4">
            <MagneticButton>
              <button onClick={() => navigate('/projects/create')} className="px-8 py-4 bg-gradient-to-br from-[var(--indigo-primary)] to-[var(--violet)] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all">
                <Plus className="h-5 w-5" /> Start Project
              </button>
            </MagneticButton>
            <MagneticButton>
              <button onClick={() => navigate('/discover/projects')} className="px-8 py-4 glass-surface border border-[var(--border-subtle)] rounded-2xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
                <Search className="h-5 w-5" /> Explore
              </button>
            </MagneticButton>
          </div>
        </motion.section>

        {/* STATS SECTION WITH SKELETONS */}
        <ScrollSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {[
              { label: "Active Projects", value: projectCount, icon: <FolderOpen />, link: "/projects/my-projects" },
              { label: "Skills", value: skillCount, icon: <TrendingUp />, link: "/skills" }
            ].map((stat, idx) => (
              <TiltCard key={idx}>
                <div onClick={() => navigate(stat.link)} className="glass-surface rounded-2xl p-6 border border-[var(--border-subtle)] cursor-pointer">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 bg-gradient-to-br from-[var(--indigo-primary)] to-[var(--violet)]">
                    {stat.icon}
                  </div>
                  {loading ? <Skeleton className="h-9 w-14 mb-1 bg-white/5" /> : <div className="text-3xl font-black text-[var(--text-bright)] mb-1">{stat.value}</div>}
                  <div className="text-sm font-medium text-[var(--text-secondary)]">{stat.label}</div>
                </div>
              </TiltCard>
            ))}
          </div>
        </ScrollSection>

        {/* EVENTS SECTION WITH SKELETONS */}
        <ScrollSection delay={0.1}>
          <div className="mb-20">
            <h2 className="text-4xl font-black mb-8 text-[var(--text-bright)]">Upcoming Events</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-surface rounded-2xl p-6 space-y-3"><Skeleton className="h-6 w-3/4 bg-white/5" /><Skeleton className="h-4 w-full bg-white/5" /></div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingEvents.map((event, idx) => (
                  <Card key={idx} onClick={() => navigate(`/events/${event.id}`)} className="border-0 glass-surface hover:scale-[1.02] transition-transform cursor-pointer">
                    <CardContent className="p-6">
                      <Calendar className="h-6 w-6 text-blue-400 mb-4" />
                      <h3 className="text-xl font-bold mb-2 text-[var(--text-bright)]">{event.name}</h3>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{event.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : <p className="text-center text-slate-500 py-10">No events scheduled.</p>}
          </div>
        </ScrollSection>

        {/* ACTIVITY & TRENDING SECTION */}
        <ScrollSection delay={0.2}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-black mb-6 text-[var(--text-bright)]">Recent Activity</h2>
              <div className="space-y-3">
                {RECENT_ACTIVITIES.map((activity, idx) => (
                  <div key={idx} onClick={() => navigate(activity.path)} className="glass-surface p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:translate-x-1 transition-transform border border-[var(--border-subtle)]">
                    <div className={`${activity.color} p-2 rounded-lg text-white`}>{activity.icon}</div>
                    <div className="flex-grow"><p className="font-bold text-[var(--text-bright)] text-sm">{activity.title}</p></div>
                    <ChevronRight className="h-5 w-5 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black mb-6 text-[var(--text-bright)]">Trending Skills</h2>
              <div className="glass-surface rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
                {TRENDING_SKILLS.map((skill, idx) => (
                  <div key={idx} onClick={() => navigate(`/skills/${skill.name}`)} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 cursor-pointer border-b border-[var(--border-subtle)] last:border-0">
                    <p className="font-bold text-[var(--text-bright)]">{skill.name}</p>
                    <span className="text-emerald-400 text-sm font-bold">↑ {skill.trend}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollSection>
      </main>

      <ProjectDetailModal project={selectedProject} open={isModalOpen} onOpenChange={setIsModalOpen} />

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-surface border border-[var(--border-subtle)] p-8 rounded-[2rem] max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6 mx-auto">
                <LogOut className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black mb-3 text-center text-[var(--text-bright)]">Sign Out</h3>
              <p className="text-[var(--text-secondary)] mb-8 text-center leading-relaxed">
                Are you sure you want to exit? Your session will be terminated and you'll need to sign back in.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-500/20 transition-all active:scale-[0.98]"
                >
                  Yes, Sign Out
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full px-6 py-4 glass-surface rounded-2xl font-bold hover:bg-white/5 transition-all text-[var(--text-primary)] border border-[var(--border-subtle)]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}