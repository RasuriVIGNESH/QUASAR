import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLoader } from '../../App';
import React, { useState, Suspense, useEffect, useCallback } from 'react';
import { BriefcaseBusiness, Home, Bell, Search, CalendarDays, User, Target, Inbox, MessageSquare, Menu, X, Moon, Sun, CheckCheck, ArrowRight } from 'lucide-react';
import notificationService from '@/services/NotificationService';

const navigationGroups = [
  { label: 'Work', items: [{ label: 'Dashboard', icon: Home, route: '/dashboard' }, { label: 'My projects', icon: BriefcaseBusiness, route: '/projects/my-projects' }, { label: 'Requests', icon: Inbox, route: '/requests' }] },
  { label: 'Discover', items: [{ label: 'Discover projects', icon: Search, route: '/discover/projects' }, { label: 'Events', icon: CalendarDays, route: '/events' }] },
  { label: 'Workspace', items: [{ label: 'Skills insights', icon: Target, route: '/skills' }, { label: 'Chat & rooms', icon: MessageSquare, route: '/messages' }, { label: 'Profile', icon: User, route: '/profile' }] },
];
const unwrap = response => response?.data?.data ?? response?.data ?? response;

export default function ResponsiveLayout() {
  const { userProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const loadNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications({ page: 0, size: 6 });
      const body = unwrap(response);
      const content = Array.isArray(body) ? body : body?.content || [];
      setNotifications(content);
      setUnreadCount(content.filter(item => !item.read).length);
    } catch { /* Notifications never block the shell. */ }
  }, []);
  useEffect(() => {
    if (!userProfile) return undefined;
    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, [userProfile, loadNotifications]);
  const markRead = async id => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(items => items.map(item => item.id === id ? { ...item, read: true } : item));
      setUnreadCount(count => Math.max(0, count - 1));
    } catch { /* Keep menu usable if notification state cannot be updated. */ }
  };
  const markAllRead = async () => {
    try { await notificationService.markAllAsRead(); setNotifications(items => items.map(item => ({ ...item, read: true }))); setUnreadCount(0); } catch { /* no-op */ }
  };
  const openNotification = async item => {
    if (!item.read) await markRead(item.id);
    const tab = item.eventType === 'PROJECT_INVITATION' ? 'invitations' : item.eventType === 'JOIN_REQUEST' ? 'received' : 'sent';
    setNotificationsOpen(false);
    navigate(`/requests?tab=${tab}`);
  };
  const handleNavigate = route => { navigate(route); setSidebarOpen(false); };
  const isActive = route => location.pathname === route || (route === '/discover/projects' && location.pathname === '/discover/recommended');
  const isDark = theme === 'dark';
  const displayName = userProfile?.firstName || userProfile?.name || 'Student';
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-teal-100 dark:selection:bg-teal-900/40">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-6 dark:border-slate-800"><button className="flex items-center gap-3" onClick={() => handleNavigate('/dashboard')}><img src="/Logo.png" alt="Quasar" className="h-8 w-8 rounded-lg object-cover" /><span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Quasar</span></button><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
        <nav className="flex-1 overflow-y-auto px-3 py-5">{navigationGroups.map(group => <div key={group.label} className="mb-6"><p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">{group.label}</p><div className="space-y-1">{group.items.map(item => { const Icon = item.icon; const active = isActive(item.route); return <button key={item.route} onClick={() => handleNavigate(item.route)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${active ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'}`}><Icon size={17} strokeWidth={active ? 2.3 : 2} /><span>{item.label}</span>{item.route === '/requests' && unreadCount > 0 && <span className="ml-auto rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{unreadCount}</span>}</button>; })}</div></div>)}</nav>
        <div className="border-t border-slate-100 p-3 dark:border-slate-800"><button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">{isDark ? <Sun size={17} /> : <Moon size={17} />}<span>{isDark ? 'Light mode' : 'Dark mode'}</span></button><button onClick={() => handleNavigate('/profile')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"><span className="grid h-8 w-8 place-items-center rounded-full bg-teal-700 text-xs font-bold text-white">{displayName[0]}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">{displayName}</span><span className="block text-[10px] text-slate-400">Student account</span></span></button></div>
      </aside>
      {sidebarOpen && <button className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation overlay" />}
      <div className="lg:pl-64"><header className="sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-6"><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{location.pathname.startsWith('/projects/') ? 'Project workspace' : location.pathname === '/discover/projects' ? 'Discover projects' : 'Student workspace'}</span><span className="flex-1" /><span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Available</span><div className="relative"><button onClick={() => setNotificationsOpen(value => !value)} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Open notifications"><Bell size={18} />{unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-teal-700 px-1 text-center text-[9px] font-bold leading-4 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}</button><AnimatePresence>{notificationsOpen && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-11 z-50 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800"><div><p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p><p className="text-[11px] text-slate-400">Recent activity and requests</p></div><button onClick={markAllRead} className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300"><CheckCheck size={13} /> Mark read</button></div>{notifications.length === 0 ? <p className="px-4 py-8 text-center text-xs text-slate-400">You are all caught up.</p> : notifications.map(item => <button key={item.id} onClick={() => openNotification(item)} className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${!item.read ? 'bg-teal-50/60 dark:bg-teal-950/30' : ''}`}><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-600" style={{ opacity: item.read ? 0 : 1 }} /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">{item.title || 'Notification'}</span><span className="mt-1 block line-clamp-2 text-[11px] leading-4 text-slate-500">{item.message}</span><span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-teal-700 dark:text-teal-300">Open <ArrowRight size={11} /></span></span></button>)}</motion.div>}</AnimatePresence></div><button onClick={() => handleNavigate('/profile')} className="grid h-8 w-8 place-items-center rounded-full bg-teal-700 text-xs font-bold text-white" aria-label="Open profile">{displayName[0]}</button></header><main className="min-h-[calc(100vh-60px)] bg-slate-50/80 dark:bg-slate-950"><Suspense fallback={<PageLoader />}><Outlet /></Suspense></main></div>
    </div>
  );
}
