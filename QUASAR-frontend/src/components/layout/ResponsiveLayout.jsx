import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLoader } from '../../App';
import React, { useState, Suspense } from 'react';

import {
    Briefcase, Zap, User, LogOut, Menu, X,
    Home, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResponsiveLayout() {
    const { userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigationItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, route: '/dashboard' },
        { id: 'my-projects', label: 'My Projects', icon: Briefcase, route: '/projects/my-projects' },
        { id: 'skills', label: 'Skills', icon: Zap, route: '/skills' },
        { id: 'profile', label: 'Profile', icon: User, route: '/profile' },
    ];

    const handleNavigate = (route) => {
        navigate(route);
        setSidebarOpen(false);
    };

    const isActive = (route) => location.pathname === route;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-72 lg:bg-white lg:border-r lg:border-slate-200 lg:flex lg:flex-col lg:z-40">
                {/* Logo Section */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <img
                            src="/Logo.png"
                            alt="Quasar Logo"
                            className="w-10 h-10 object-contain"
                            onError={(e) => { e.target.src = "https://placehold.co/40x40?text=Q" }}
                        />
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quasar</h1>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Project Hub</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.route);
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.route)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-semibold text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
                    <div className="flex items-center gap-3 p-2">
                        <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-full text-blue-700 flex items-center justify-center font-bold text-sm shadow-sm">
                            {userProfile?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                                {userProfile?.firstName} {userProfile?.lastName}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{userProfile?.email}</p>
                        </div>
                    </div>
                    <Button
                        onClick={logout}
                        variant="ghost"
                        className="w-full justify-start gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl"
                    >
                        <LogOut size={18} />
                        <span className="font-semibold">Sign Out</span>
                    </Button>
                </div>
            </aside>

            {/* MOBILE HEADER */}
            <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="/Logo.png" alt="Quasar Logo" className="w-8 h-8 object-contain" />
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">Quasar</h1>
                </div>
                <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => navigate('/messages')}>
                        <Bell size={20} className="text-slate-600" />
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                    </Button>
                </div>
            </header>

            {/* MOBILE SIDEBAR OVERLAY */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* MOBILE SIDEBAR */}
            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: sidebarOpen ? 0 : -300 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed left-0 top-0 h-full w-72 bg-white z-50 shadow-2xl"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/Logo.png" alt="Quasar Logo" className="w-8 h-8 object-contain" />
                        <span className="font-bold text-lg">Quasar</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </Button>
                </div>
                <nav className="p-4 space-y-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.route);
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.route)}
                                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-semibold transition-all ${active
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <Icon size={22} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
                    <Button
                        onClick={logout}
                        variant="outline"
                        className="w-full justify-center gap-2 text-red-600 border-red-100 hover:bg-red-50 rounded-xl"
                    >
                        <LogOut size={18} />
                        <span className="font-bold">Sign Out</span>
                    </Button>
                </div>
            </motion.aside>

            <main className="lg:ml-72 min-h-screen pb-24 lg:pb-0">
                <div className="max-w-full">
                    <Suspense fallback={<PageLoader />}>
                        <Outlet />
                    </Suspense>
                </div>
            </main>

            {/* MOBILE BOTTOM NAVIGATION */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 pb-safe">
                <div className="flex items-center justify-around h-16">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.route);
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.route)}
                                className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${active
                                    ? 'text-blue-600'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                                <span className={`text-[10px] mt-1 font-bold ${active ? 'opacity-100' : 'opacity-70'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}