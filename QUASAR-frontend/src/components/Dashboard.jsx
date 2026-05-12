import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/dashboardService';
import {
  Users, LogOut, Plus, Search, Briefcase, ArrowUpRight,
  MessageSquare, User, Zap, Bell, ChevronRight,
  LayoutDashboard, Settings, TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const activePage = location.pathname;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userProfile) return;
      try {
        const [countRes] = await Promise.allSettled([
          dashboardService.getDashboardCounts()
        ]);
        if (countRes.status === 'fulfilled' && countRes.value.success) {
          setProjectCount(countRes.value.data.projectsCount || 0);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [userProfile]);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { id: 'discover', label: 'Discover', icon: Search, route: '/discover/projects' },
    { id: 'create-project', label: 'Create Project', icon: Plus, route: '/projects/create' },
    { id: 'my-projects', label: 'My Projects', icon: Briefcase, route: '/projects/my-projects' },
    { id: 'skills', label: 'Tech Stack', icon: Zap, route: '/skills' },
    { id: 'profile', label: 'Profile', icon: User, route: '/profile' }
  ];

  const quickStats = [
    {
      label: 'Active Projects',
      value: projectCount,
      icon: Briefcase,
      route: '/projects/my-projects',
      color: 'from-teal-50 to-cyan-50',
      iconColor: 'text-teal-600'
    },
    {
      label: 'Pending Invites',
      value: 3,
      icon: Bell,
      route: '/messages',
      color: 'from-amber-50 to-orange-50',
      iconColor: 'text-amber-600'
    },
    {
      label: 'Network',
      value: userProfile?.connectionCount || 0,
      icon: Users,
      route: '/discover/students',
      color: 'from-blue-50 to-indigo-50',
      iconColor: 'text-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900 font-sans antialiased flex">

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 z-40 hidden lg:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quasar</h1>
              <p className="text-xs text-slate-500">Project Hub</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.route;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-teal-50 text-teal-700 border-l-2 border-teal-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Icon size={20} className={isActive ? 'text-teal-600' : 'group-hover:text-teal-600'} />
                <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                {item.badge && !isActive && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all font-medium text-sm"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 lg:ml-72 min-h-screen">

        {/* HEADER: User Profile (Tight Corners) */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* USER PROFILE CARD */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 p-1.5 pr-4 rounded-lg">
              <div className="w-8 h-8 bg-teal-600 rounded text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {userProfile?.firstName?.charAt(0)}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 leading-none">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </span>
                  <span className="text-[9px] font-bold text-teal-600 uppercase tracking-tighter bg-white px-1 border border-teal-100 rounded">@student</span>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-[10px] font-semibold text-teal-700 hover:text-teal-900 uppercase tracking-wider mt-0.5 text-left transition-colors"
                >
                  View Profile
                </button>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="p-8">
          <section className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              Welcome back, {userProfile?.firstName}!
            </h1>
            <p className="text-slate-500 text-sm font-medium">Here's what's happening with your workspace.</p>
          </section>

          {/* QUICK STATS (INTERACTIVE) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {quickStats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(stat.route)}
                className={`bg-gradient-to-br ${stat.color} border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-white flex items-center justify-center ${stat.iconColor} shadow-sm group-hover:shadow-md transition-shadow`}>
                    <stat.icon size={24} />
                  </div>
                  <TrendingUp size={16} className="text-slate-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Projects */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Recent Builds</h3>
                <button
                  onClick={() => navigate('/projects/my-projects')}
                  className="text-teal-600 hover:text-teal-700 font-semibold text-sm flex items-center gap-2 group"
                >
                  View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="space-y-4">
                {[1, 2].map((project, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-teal-200 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                          AI Study Assistant Node
                        </h4>
                        <p className="text-sm text-slate-600 mt-1">ML-based platform to help students with coursework</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
                        In Progress
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                              {i + 1}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500 font-medium ml-2">4 members</span>
                      </div>
                      <ArrowUpRight size={18} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => navigate('/projects/create')}
                  className="w-full py-4 border-2 border-dashed border-teal-200 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 flex items-center justify-center gap-2 text-teal-600 font-semibold group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Start New Project
                </button>
              </div>
            </div>

            {/* Side Widgets */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Recent Messages</h3>
                <button onClick={() => navigate('/messages')} className="text-teal-600 hover:text-teal-700"><MessageSquare size={18} /></button>
              </div>

              <div className="space-y-3">
                {[1, 2].map((msg, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate('/messages')}
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-xl">👩‍💻</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 group-hover:text-teal-600 transition-colors">Team Invitation</p>
                        <p className="text-xs text-slate-600 mt-1 truncate">Sarah invited you to join Mobile App Dev</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/discover/projects')}
                className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group mt-6"
              >
                <Search size={18} className="group-hover:scale-110 transition-transform" /> Discover Projects
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}