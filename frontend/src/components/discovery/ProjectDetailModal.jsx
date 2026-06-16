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
    X
} from 'lucide-react';
import { joinRequestService } from '../../services/JoinRequestService';
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
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!project) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] rounded-xl p-0 border-slate-200 overflow-hidden shadow-lg flex flex-col bg-white">
                {/* HEADER - Light Mode */}
                <div className="bg-gradient-to-br from-slate-50 to-white p-6 border-b border-slate-100 shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                {project.categoryName && (
                                    <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold text-xs px-2 py-0">
                                        {project.categoryName}
                                    </Badge>
                                )}
                                {project.status && (
                                    <Badge variant="outline" className="text-slate-600 border-slate-200 font-bold px-2 text-[9px] uppercase tracking-wide">
                                        {project.status}
                                    </Badge>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight mb-2">
                                {project.title}
                            </h2>
                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <span className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                                    {project.currentTeamSize || 1} / {project.maxTeamSize || 4}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-indigo-600" />
                                    Posted recently
                                </span>
                            </div>
                        </div>
                        {/* <button
                            onClick={() => onOpenChange(false)}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                        >
                            <X size={20} />
                        </button> */}
                    </div>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="overflow-y-auto flex-1 min-h-0">
                    <div className="p-6 space-y-6">
                        {/* Description */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About This Project</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {project.description || project.goals || 'The team has not yet provided a detailed description for this project.'}
                            </p>
                        </div>

                        {/* Skills */}
                        {project.requiredSkills?.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {project.requiredSkills.map((s, i) => (
                                        <Badge
                                            key={i}
                                            className="bg-slate-100 border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs font-semibold"
                                        >
                                            {typeof s === 'string' ? s : s.skill?.name || s.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Application Form */}
                        {!hasApplied && !checkingStatus && (
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Message</h4>
                                <Textarea
                                    placeholder="Tell the team why you're interested in this project..."
                                    className="rounded-lg border-slate-200 min-h-[100px] p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                    value={joinRequestMessage}
                                    onChange={(e) => setJoinRequestMessage(e.target.value)}
                                />
                            </div>
                        )}

                        {hasApplied && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <p className="text-sm font-semibold text-emerald-700">✓ Application sent successfully</p>
                                <p className="text-xs text-emerald-600 mt-1">The team will review your message soon.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER - Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4 justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        {project.lead && (
                            <div className="flex items-center gap-3">
                                <Avatar className="w-9 h-9 border border-slate-200 shadow-sm">
                                    <AvatarImage src={project.lead.profilePictureUrl} />
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xs">
                                        {project.lead.firstName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900">{project.lead.firstName} {project.lead.lastName}</p>
                                    <p className="text-[11px] text-slate-500 font-medium">Lead</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleJoinRequest}
                        disabled={isSubmitting || hasApplied || checkingStatus}
                        className={`rounded-lg px-6 h-10 font-bold text-sm transition-all ${hasApplied
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                    >
                        {isSubmitting || checkingStatus ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                        ) : hasApplied ? (
                            <span className="flex items-center gap-2">
                                <Send className="h-3.5 w-3.5" /> Sent
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Apply Now <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
