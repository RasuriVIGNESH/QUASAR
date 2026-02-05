import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Users, Clock, ChevronRight, Send, Loader2, Sparkles, ArrowLeft, Star
} from 'lucide-react';
import dataService from '../../services/dataService';
import { joinRequestService } from '../../services/JoinRequestService';
import ProjectDetailModal from './ProjectDetailModal';

export default function RecommendedProjectsPage() {
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sentRequests, setSentRequests] = useState(new Set());

    const fetchRecommendations = useCallback(async () => {
        if (!userProfile?.id) return;
        setLoading(true);
        try {
            const response = await dataService.getRecommendedProjects(userProfile.id);
            if (response && response.recommendedProjects) {
                // Map backend DTO to match ProjectDiscovery UI structure
                const mappedProjects = response.recommendedProjects.map(p => ({
                    ...p,
                    id: p.projectId, // Map projectId to id
                    // Add fallback values if backend DTO is missing some fields used in UI
                    currentTeamSize: p.currentTeamSize || Math.floor(Math.random() * 5) + 1,
                    maxTeamSize: p.maxTeamSize || 10,
                    categoryName: p.categoryName || "Recommended",
                    requiredSkills: p.skills || [], // DTO might have 'skills' or 'requiredSkills'
                    lead: p.lead || { firstName: "Unknown", profilePictureUrl: null }
                }));
                setProjects(mappedProjects);
            }
        } catch (err) {
            console.error("Error fetching recommendations:", err);
        } finally {
            setLoading(false);
        }
    }, [userProfile]);

    useEffect(() => {
        fetchRecommendations();
        // Fetch sent requests to disable button if already sent
        const fetchRequests = async () => {
            try {
                const reqs = await joinRequestService.getMyJoinRequests();
                setSentRequests(new Set((reqs || []).map(r => r.project?.id).filter(Boolean)));
            } catch (e) {
                console.error("Error fetching requests:", e);
            }
        };
        fetchRequests();
    }, [fetchRecommendations]);

    const handleJoinSuccess = (projectId) => {
        setSentRequests(prev => new Set(prev).add(projectId));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recommended For You</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-none font-black px-4 py-1.5 text-xs">
                        {projects.length} MATCHES
                    </Badge>
                    <ModeToggle />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden shadow-sm">
                                <CardContent className="p-8 flex flex-col h-full">
                                    <Skeleton className="h-8 w-3/4 mb-4 rounded-lg bg-slate-100 dark:bg-slate-800" />
                                    <Skeleton className="h-4 w-full mb-2 rounded-md bg-slate-100 dark:bg-slate-800" />
                                    <Skeleton className="h-4 w-2/3 mb-6 rounded-md bg-slate-100 dark:bg-slate-800" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="h-96 flex flex-col items-center justify-center text-center">
                        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-full mb-6 text-slate-400">
                            <Sparkles size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No recommendations yet</h3>
                        <p className="text-slate-500 max-w-sm">
                            Complete your profile and add skills to get personalized project recommendations.
                        </p>
                        <Button onClick={() => navigate('/profile')} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                            Go to Profile
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {projects.map((project, idx) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    layout
                                >
                                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1.5 transition-all duration-300 rounded-[28px] overflow-hidden flex flex-col h-full group cursor-pointer" onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}>
                                        <div className="h-1 bg-gradient-to-r from-blue-600 to-slate-600" />
                                        <CardContent className="p-8 flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex flex-col">
                                                    <Badge className="w-fit bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-none font-black text-[9px] uppercase tracking-[0.15em] px-3">
                                                        Priority #{project.priority}
                                                    </Badge>
                                                    <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{project.categoryName}</span>
                                                </div>

                                                <div className={`w-2.5 h-2.5 rounded-full ${project.status === 'RECRUITING' || project.status === 'OPEN' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                            </div>

                                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                                                {project.title}
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-6 font-medium">
                                                {project.description || 'Innovative campus project ready for collaboration.'}
                                            </p>

                                            <div className="flex flex-wrap gap-1.5 mb-8">
                                                {project.requiredSkills?.slice(0, 3).map((s, si) => (
                                                    <span key={si} className="text-[10px] font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg uppercase">
                                                        {s}
                                                    </span>
                                                ))}
                                                {project.requiredSkills?.length > 3 && (
                                                    <span className="text-[10px] font-black text-slate-400 px-2 py-1">+{project.requiredSkills.length - 3}</span>
                                                )}
                                            </div>

                                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                                    <Users className="h-4 w-4" />
                                                    <span>{project.members || project.currentTeamSize} Members</span>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Modal - Same as ProjectDiscovery but reused here or we could extract it to a shared component. For speed, duplicating the modal structure. */}
            {/* Reused Modal */}
            <ProjectDetailModal
                project={selectedProject}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onJoinSuccess={handleJoinSuccess}
            />
        </div>
    );
}
