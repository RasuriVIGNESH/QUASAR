import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLoader } from '../../App';
import React, { useState, Suspense } from 'react';

import {
    Briefcase, Zap, User, LogOut, Menu, X,
    Home, Bell, PlusSquare, Search, Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResponsiveLayout() {
    const { userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigationItems = [
        { id: 'dashboard', label: 'Home', icon: Home, route: '/dashboard' },
        { id: 'discover', label: 'Explore', icon: Compass, route: '/discover/projects' },
        { id: 'my-projects', label: 'Projects', icon: Briefcase, route: '/projects/my-projects' },
        { id: 'skills', label: 'Skills', icon: Zap, route: '/skills' },
        { id: 'profile', label: 'Profile', icon: User, route: '/profile' },
    ];

    const handleNavigate = (route) => {
        navigate(route);
        setSidebarOpen(false);
    };

    const isActive = (route) => location.pathname === route;

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
            {/* DESKTOP SIDEBAR - Professional & Minimalist */}
            <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:bg-white lg:border-r lg:border-slate-200 lg:flex lg:flex-col lg:z-40">
                <div className="p-8">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <img src="/Logo.png" alt="Quasar" className="w-8 h-8 rounded-lg object-cover" />
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quasar</h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.route);
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.route)}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${active
                                    ? 'bg-slate-50 text-indigo-600 font-bold'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                    }`}
                            >
                                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                    >
                        <LogOut size={20} />
                        <span className="text-sm">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* MOBILE TOP BAR - Instagram Style */}
            <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <img src="/Logo.png" alt="Quasar" className="w-7 h-7 rounded-lg object-cover" />
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">Quasar</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/projects/create')} className="text-slate-900">
                        <PlusSquare size={24} strokeWidth={2} />
                    </button>
                    <button onClick={() => navigate('/messages')} className="text-slate-900 relative">
                        <Bell size={24} strokeWidth={2} />
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0 bg-slate-50/30">
                <div className="max-w-full">
                    <Suspense fallback={<PageLoader />}>
                        <Outlet />
                    </Suspense>
                </div>
            </main>

            {/* MOBILE BOTTOM NAVIGATION - Instagram Style */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 px-2 pb-safe">
                <div className="flex items-center justify-around h-14">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.route);
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.route)}
                                className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${active
                                    ? 'text-slate-900 scale-110'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Icon size={26} strokeWidth={active ? 2.5 : 2} />
                            </button>
                        );
                    })}

                </div>
            </nav>
        </div>
    );
}
