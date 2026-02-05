import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Users,
    Clock,
    Send,
    Loader2,
    ChevronRight,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { joinRequestService } from '../../services/JoinRequestService';
import ProjectChatBot from './ProjectChatBot';
import { useAuth } from '../../contexts/AuthContext';

export default function ProjectDetailModal({ project, open, onOpenChange, onJoinSuccess }) {
    const { currentUser } = useAuth();
    const [joinRequestMessage, setJoinRequestMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);

    useEffect(() => {
        const checkApplicationStatus = async () => {
            if (!project?.id || !open || !currentUser) return;

            setCheckingStatus(true);
            try {
                // Optimistically check if we already have the status passed down, 
                // otherwise fetch from API
                const response = await joinRequestService.getMyJoinRequests();
                const hasJoined = response.some(req => req.project?.id === project.id);
                setHasApplied(hasJoined);
            } catch (error) {
                console.error("Failed to check join status", error);
            } finally {
                setCheckingStatus(false);
            }
        };

        checkApplicationStatus();
        // Reset message when opening new project
        if (open) {
            setJoinRequestMessage('');
        }
    }, [project?.id, open, currentUser]);

    const handleJoinRequest = async () => {
        if (!project?.id) return;

        setIsSubmitting(true);
        try {
            await joinRequestService.sendJoinRequest(project.id, joinRequestMessage);
            setHasApplied(true);
            setJoinRequestMessage('');
            if (onJoinSuccess) {
                onJoinSuccess(project.id);
            }
        } catch (e) {
            console.error("Error sending request:", e);
            // Ideally show toast error here
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!project) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] rounded-[32px] p-0 border-none overflow-hidden shadow-2xl flex flex-col bg-white dark:bg-slate-950">
                <AnimatePresence>
                    <div className="flex flex-col w-full h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 relative z-50">
                        {/* Header Section */}
                        <div className="bg-slate-900 p-10 text-white relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    {project.categoryName && (
                                        <Badge className="bg-blue-600 text-white border-none font-bold px-3">
                                            {project.categoryName}
                                        </Badge>
                                    )}
                                    {project.status && (
                                        <Badge variant="outline" className="text-slate-400 border-slate-700 font-bold px-3 uppercase tracking-widest text-[10px]">
                                            {project.status}
                                        </Badge>
                                    )}
                                    {project.priority && (
                                        <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold px-3 text-[10px] uppercase tracking-wider">
                                            Priority #{project.priority}
                                        </Badge>
                                    )}
                                </div>

                                <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight">
                                    {project.title}
                                </h2>

                                <div className="flex items-center gap-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {project.currentTeamSize || 1} / {project.maxTeamSize || 4} Capacity
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Posted recently
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-10 bg-white dark:bg-slate-950 overflow-y-auto scrollbar-hide flex-1 min-h-0">
                            <div className="space-y-8">
                                {/* Description */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Objective & Scope</h4>
                                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-medium">
                                        {project.description || project.goals || 'The team has not yet provided a detailed description for this objective.'}
                                    </p>
                                </div>

                                {/* Skills */}
                                {project.requiredSkills?.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Required Expertise</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {project.requiredSkills.map((s, i) => (
                                                <Badge
                                                    key={i}
                                                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-1.5 rounded-xl text-sm font-bold shadow-sm"
                                                >
                                                    {typeof s === 'string' ? s : s.skill?.name || s.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Application Form */}
                                <div className="pt-4 space-y-4">
                                    {!hasApplied && !checkingStatus && (
                                        <>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Application Message</h4>
                                            <Textarea
                                                placeholder="Express your interest. Why are you excited about this project?"
                                                className="rounded-2xl border-slate-200 dark:border-slate-700 min-h-[120px] p-5 text-base focus:ring-2 focus:ring-blue-500 shadow-inner dark:bg-slate-900 dark:text-white"
                                                value={joinRequestMessage}
                                                onChange={(e) => setJoinRequestMessage(e.target.value)}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-4 justify-between shrink-0 items-center">
                            <div className="flex items-center gap-3">
                                {project.lead && (
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10 border-2 border-white dark:border-slate-800 shadow-sm">
                                            <AvatarImage src={project.lead.profilePictureUrl} />
                                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                                {project.lead.firstName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{project.lead.firstName} {project.lead.lastName}</p>
                                            <p className="text-xs text-slate-500 font-medium">Project Lead</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleJoinRequest}
                                disabled={isSubmitting || hasApplied || checkingStatus}
                                className={`rounded-xl px-10 h-12 font-black transition-all shadow-lg hover:scale-105 ${hasApplied
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 dark:shadow-none'
                                    }`}
                            >
                                {isSubmitting || checkingStatus ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : hasApplied ? (
                                    <span className="flex items-center gap-2">
                                        <Send className="h-4 w-4" /> Application Sent
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Submit Application <ChevronRight className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </div>

                        {/* AI Chat Bot Assistant */}
                        <ProjectChatBot project={project} />
                    </div>
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
