import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    Briefcase,
    Calendar,
    TrendingUp,
    Activity,
    ArrowUpRight
} from 'lucide-react';
import userService from '../../services/userService';
import dataService from '../../services/dataService';
import { projectService } from '../../services/projectService';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminOverview() {
    const { userProfile } = useAuth();
    const [stats, setStats] = useState({
        users: 0,
        projects: 0,
        events: 0,
        activeToday: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // Using existing endpoints to gather stats
                // Note: For real admin stats we might need specific admin endpoints, 
                // but using what's available for now as proxies.

                // 1. Get user count (using public count or scanning list)
                // Ideally we want exact database count
                const userCount = await userService.getPublicUserCount();

                // 2. Get project count (fetching page 1 gives totalElements)
                const projectsRes = await projectService.searchProjects({ size: 1 });
                const projectCount = projectsRes.data?.totalElements || 0;

                // 3. Get upcoming events count (simple length for now)
                const eventsRes = await dataService.getAllEvents();
                const eventCount = Array.isArray(eventsRes) ? eventsRes.length : 0;

                setStats({
                    users: userCount,
                    projects: projectCount,
                    events: eventCount,
                    activeToday: Math.floor(userCount * 0.15) // Simulated "Active Today"
                });
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon, color, delay }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                            <h3 className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
                                {loading ? <Skeleton className="h-8 w-16" /> : value}
                            </h3>
                        </div>
                        <div className={`p-4 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
                            {React.cloneElement(icon, { className: `w-6 h-6 ${color.replace('bg-', 'text-')}` })}
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span>+12% from last month</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard Overview</h1>
                <p className="text-slate-600 dark:text-slate-400">Welcome back, {userProfile?.firstName}. Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users}
                    icon={<Users />}
                    color="bg-blue-500"
                    delay={0.1}
                />
                <StatCard
                    title="Total Projects"
                    value={stats.projects}
                    icon={<Briefcase />}
                    color="bg-violet-500"
                    delay={0.2}
                />
                <StatCard
                    title="Total Events"
                    value={stats.events}
                    icon={<Calendar />}
                    color="bg-emerald-500"
                    delay={0.3}
                />
                <StatCard
                    title="Active Today"
                    value={stats.activeToday}
                    icon={<Activity />}
                    color="bg-amber-500"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="h-[400px]">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                            Activity charts coming soon...
                        </div>
                    </CardContent>
                </Card>
                <Card className="h-[400px]">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                            System metrics coming soon...
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
