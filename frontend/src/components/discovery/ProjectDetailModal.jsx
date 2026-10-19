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
import recommendationService from '../../services/recommendationService';
import { toast } from 'sonner';

const unwrapProject = (response) => {
    let value = response;
    for (let index = 0; index < 4; index += 1) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) break;
        if (value.project && typeof value.project === 'object') {
            value = value.project;
            continue;
        }
        if (value.data && typeof value.data === 'object' && !Array.isArray(value.data)) {
            value = value.data;
            continue;
        }
        break;
    }
    return value || {};
};

export default function ProjectDetailModal({ project, open, onOpenChange, onJoinSuccess }) {
    const { currentUser } = useAuth();
    const [joinRequestMessage, setJoinRequestMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [safeProject, setSafeProject] = useState(null);
    const [loadingProject, setLoadingProject] = useState(false);

    useEffect(() => {
        const loadSafeProject = async () => {
            if (!project?.id || !open) return;
            setLoadingProject(true);
            try {
                const response = await recommendationService.getDiscoveryProject(project.id);
                const fetchedProject = unwrapProject(response);
                const mergedProject = {
                    ...project,
                    ...fetchedProject,
                    requiredRoles: Array.isArray(fetchedProject.requiredRoles)
                        ? fetchedProject.requiredRoles
                        : (Array.isArray(project.requiredRoles) ? project.requiredRoles : [])
                };
                setSafeProject(mergedProject);
                const firstOpenRole = mergedProject.requiredRoles.find(role => !role.filled);
                setSelectedRoleId(firstOpenRole ? String(firstOpenRole.id) : '');
            }
            catch {
                setSafeProject(project);
                const firstOpenRole = (project.requiredRoles || []).find(role => !role.filled);
                setSelectedRoleId(firstOpenRole ? String(firstOpenRole.id) : '');
            }
            finally { setLoadingProject(false); }
        };
        loadSafeProject();
        const checkApplicationStatus = async () => {
            if (!project?.id || !open || !currentUser) return;
            setCheckingStatus(true);
            try {
                const response = await joinRequestService.getMyJoinRequests(0, 50);
                const requests = response?.content || response?.data?.content || [];
                setHasApplied(requests.some(req => req.project?.id === project.id));
            } catch (error) {
                console.error("Failed to check join status", error);
            } finally {
                setCheckingStatus(false);
            }
        };

        checkApplicationStatus();
        if (open) {
            setJoinRequestMessage('');
            setSelectedRoleId('');
        }
    }, [project?.id, open, currentUser]);

    const handleJoinRequest = async () => {
        if (!project?.id) return;

        setIsSubmitting(true);
        try {
            const openRoles = (displayProject.requiredRoles || []).filter(role => !role.filled);
            if (openRoles.length > 0 && !selectedRoleId) { throw new Error('Choose an open project role before applying.'); }
            await joinRequestService.sendJoinRequest(project.id, joinRequestMessage, selectedRoleId || undefined);
            setHasApplied(true);
            setJoinRequestMessage('');
            if (onJoinSuccess) {
                onJoinSuccess(project.id);
            }
        } catch (e) {
            toast.error(e?.data?.message || e?.message || 'Could not submit your join request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!project) return null;
    const displayProject = safeProject || project;
    const requestedSkills = displayProject.requestedSkills || displayProject.projectCard?.skillsRequired || displayProject.skillsRequired || displayProject.requiredSkills || [];
    const requiredRoles = Array.isArray(displayProject.requiredRoles) ? displayProject.requiredRoles : [];
    const openRoles = requiredRoles.filter(role => !role.filled);
    const isRecruiting = displayProject.status === 'RECRUITING' && (displayProject.currentTeamSize ?? 0) < (displayProject.maxTeamSize ?? Number.MAX_SAFE_INTEGER);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] rounded-xl p-0 border-slate-200 overflow-hidden shadow-lg flex flex-col bg-white">
                {/* HEADER - Light Mode */}
                <div className="bg-gradient-to-br from-slate-50 to-white p-6 border-b border-slate-100 shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                {displayProject.categoryName && (
                                    <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold text-xs px-2 py-0">
                                        {displayProject.categoryName}
                                    </Badge>
                                )}
                                {displayProject.status && (
                                    <Badge variant="outline" className="text-slate-600 border-slate-200 font-bold px-2 text-[9px] uppercase tracking-wide">
                                        {displayProject.status}
                                    </Badge>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight mb-2">
                                {displayProject.title}
                            </h2>
                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <span className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                                    {displayProject.currentTeamSize || 1} / {displayProject.maxTeamSize || 4}
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
                                {displayProject.description || displayProject.goals || 'The team has not yet provided a detailed description for this project.'}
                            </p>
                        </div>

                        {/* Skills */}
                        {requestedSkills.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {requestedSkills.map((s, i) => (
                                        <Badge
                                            key={i}
                                            className="bg-slate-100 border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs font-semibold"
                                        >
                                            {typeof s === 'string' ? s : s.name || s.skill?.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {requiredRoles.length > 0 && <div className="space-y-3"><div className="flex items-center justify-between"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose a role</h4><span className="text-xs font-semibold text-slate-500">{openRoles.length} open</span></div>{openRoles.length > 0 ? <div className="space-y-2">{openRoles.map(role => <label key={role.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 ${selectedRoleId === String(role.id) ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'}`}><input type="radio" name="project-role" checked={selectedRoleId === String(role.id)} onChange={() => setSelectedRoleId(String(role.id))} /><span className="text-sm font-semibold text-slate-700">{role.name}</span><Badge className="ml-auto bg-emerald-50 text-emerald-700">Needed</Badge></label>)}</div> : <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">All roles are filled. This project is not accepting role applications.</p>}</div>}

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
                        {displayProject.lead && (
                            <div className="flex items-center gap-3">
                                <Avatar className="w-9 h-9 border border-slate-200 shadow-sm">
                                    <AvatarImage src={displayProject.lead.profilePictureUrl} />
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xs">
                                        {displayProject.lead.firstName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900">{displayProject.lead.firstName} {displayProject.lead.lastName}</p>
                                    <p className="text-[11px] text-slate-500 font-medium">Lead</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleJoinRequest}
                        disabled={isSubmitting || hasApplied || checkingStatus || !isRecruiting || (requiredRoles.length > 0 && (!openRoles.length || !selectedRoleId))}
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
