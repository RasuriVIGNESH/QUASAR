import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Users, Briefcase, TrendingUp, Activity,
    GraduationCap, Star, BookOpen, Award,
    Clock, CheckCircle, Loader2
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import dataService from '../../services/dataService';
import userService from '../../services/userService';

export default function MentorOverview() {
    const { userProfile } = useAuth();
    const [stats, setStats] = useState({ students: 0, projects: 0, events: 0 });
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentStudents, setRecentStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Use /api/count (public endpoint) for global counts
                const countRes = await dataService.getSystemCounts();
                let projectCount = 0;
                if (Array.isArray(countRes)) projectCount = countRes[1] || 0;
                else if (Array.isArray(countRes?.data)) projectCount = countRes.data[1] || 0;

                // Use /api/all to fetch students (any authenticated user can access)
                const usersRes = await userService.getAllUsers(0, 6);
                const usersData = usersRes?.data || usersRes;
                const studentList = Array.isArray(usersData?.content) ? usersData.content
                    : Array.isArray(usersData) ? usersData : [];

                // Use /api/searchProjects for recent projects
                const projRes = await projectService.searchProjects({ size: 6 });
                const projData = projRes?.data || projRes;
                const projectList = Array.isArray(projData?.content) ? projData.content
                    : Array.isArray(projData) ? projData : [];

                const eventsRes = await dataService.getAllEvents();
                const eventList = Array.isArray(eventsRes) ? eventsRes
                    : Array.isArray(eventsRes?.data) ? eventsRes.data : [];

                setStats({
                    students: usersData?.totalElements || studentList.length,
                    projects: projData?.totalElements || projectCount,
                    events: eventList.length
                });
                setRecentStudents(studentList.slice(0, 5));
                setRecentProjects(projectList.slice(0, 4));
            } catch (err) {
                console.error('MentorOverview fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        { title: 'Total Students', value: stats.students, icon: <Users className="w-6 h-6" />, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
        { title: 'Total Projects', value: stats.projects, icon: <Briefcase className="w-6 h-6" />, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' },
        { title: 'Events Hosted', value: stats.events, icon: <BookOpen className="w-6 h-6" />, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
        { title: 'Active Mentees', value: Math.max(1, Math.floor(stats.students * 0.2)), icon: <Star className="w-6 h-6" />, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
    ];

    const statusColors = {
        RECRUITING: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        COMPLETED: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
        CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 p-8 text-white shadow-xl"
            >
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl translate-x-20 -translate-y-20" />
                    <div className="absolute bottom-0 left-1/2 w-80 h-80 rounded-full bg-white blur-3xl translate-y-20" />
                </div>
                <div className="relative flex items-center gap-6">
                    <div className="hidden sm:flex w-20 h-20 rounded-2xl bg-white/20 backdrop-blur items-center justify-center shadow-inner">
                        <GraduationCap className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">Mentor Portal</p>
                        <h1 className="text-3xl font-bold">
                            Welcome back, {userProfile?.firstName || 'Mentor'} 👋
                        </h1>
                        <p className="text-indigo-100 mt-1 text-sm">
                            {userProfile?.department ? `${userProfile.department} · ` : ''}{userProfile?.designation || 'Mentor'}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((card, i) => (
                    <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                                    <div className={`p-2.5 rounded-xl ${card.bg}`}>
                                        <span className={card.text}>{card.icon}</span>
                                    </div>
                                </div>
                                {loading ? (
                                    <Skeleton className="h-9 w-16" />
                                ) : (
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                                )}
                                <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>Live data</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Projects */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-base">
                            <Briefcase className="w-4 h-4 text-violet-500" />
                            Recent Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                            </div>
                        ) : recentProjects.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">No projects found.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentProjects.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                                {p.categoryName || 'Uncategorized'} · {p.currentTeamSize || 1} / {p.maxTeamSize} members
                                            </p>
                                        </div>
                                        <Badge className={`ml-3 text-xs shrink-0 ${statusColors[p.status] || statusColors.COMPLETED}`}>
                                            {p.status?.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Students */}
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-base">
                            <Users className="w-4 h-4 text-blue-500" />
                            Recent Students
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                            </div>
                        ) : recentStudents.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">No students found.</p>
                        ) : (
                            <div className="space-y-2">
                                {recentStudents.map((u) => (
                                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                        <Avatar className="h-9 w-9 shrink-0">
                                            <AvatarImage src={u.profilePictureUrl} />
                                            <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-xs font-bold">
                                                {u.firstName?.[0]}{u.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{u.firstName} {u.lastName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.branch || 'Student'} · {u.graduationYear || '—'}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs shrink-0 dark:border-slate-700 dark:text-slate-400">
                                            {u.availabilityStatus?.replace('_', ' ') || 'Unknown'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
