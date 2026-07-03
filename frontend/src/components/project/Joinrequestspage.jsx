import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    ArrowLeft, Inbox, Check, X, Loader2, ChevronLeft, ChevronRight, Send
} from 'lucide-react';
import { toast } from 'sonner';

import projectService, { toArray, toPage } from '@/services/projectService';
import { teamService } from '@/services/TeamService';

const PAGE_SIZE = 10;

const STATUS_STYLE = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    REJECTED: 'bg-red-50 text-red-700 border-red-100',
};

const TYPE_STYLE = {
    INVITATION: { label: 'Invitation Sent', className: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    REQUEST: { label: 'Join Request', className: 'bg-blue-50 text-blue-700 border-blue-100' },
};

const FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'];

function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
export default function JoinRequestsPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { userProfile, currentUser } = useAuth();

    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [loadingAccess, setLoadingAccess] = useState(true);

    const [requests, setRequests] = useState([]);
    const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, totalElements: 0, first: true, last: true });
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [respondingId, setRespondingId] = useState(null);
    const [filter, setFilter] = useState('PENDING');

    const currentUserId = useMemo(() => userProfile?.id || currentUser?.id, [userProfile, currentUser]);

    // Anyone in the project — member or lead — is allowed to view and respond.
    const isMember = useMemo(() => {
        if (!project) return false;
        const leadId = project?.team?.lead?.id ?? project?.team?.lead
            ?? project?.lead?.id ?? project?.lead;
        if (String(currentUserId) === String(leadId)) return true;
        return members.some(m => String(m.user?.id ?? m.userId) === String(currentUserId));
    }, [project, members, currentUserId]);

    const loadAccess = useCallback(async () => {
        if (!projectId) return;
        try {
            const [projectData, membersRes] = await Promise.all([
                projectService.getProject(projectId),
                teamService.getProjectMembers(projectId),
            ]);
            setProject(projectData);
            setMembers(toArray(membersRes));
        } catch (err) {
            console.error('Failed to load project:', err);
            toast.error('Failed to load project');
        } finally {
            setLoadingAccess(false);
        }
    }, [projectId]);

    const loadRequests = useCallback(async (targetPage = 0) => {
        if (!projectId) return;
        setLoadingRequests(true);
        try {
            const res = await projectService.getJoinRequests(projectId, { page: targetPage, size: PAGE_SIZE });
            const normalized = toPage(res);
            setRequests(normalized.content);
            setPageInfo(normalized);
        } catch (err) {
            console.error('Failed to load join requests:', err);
            toast.error('Failed to load join requests');
        } finally {
            setLoadingRequests(false);
        }
    }, [projectId]);

    useEffect(() => { loadAccess(); }, [loadAccess]);
    useEffect(() => { loadRequests(0); }, [loadRequests]);

    const handleRespond = async (requestId, response) => {
        setRespondingId(requestId);
        try {
            await projectService.respondToJoinRequest(requestId, response);
            toast.success(response === 'ACCEPTED' ? 'Request accepted' : 'Request rejected');
            // Refresh the current page of requests, and the member list if someone just joined.
            loadRequests(pageInfo.number);
            if (response === 'ACCEPTED') loadAccess();
        } catch (err) {
            console.error('Failed to respond to request:', err);
            toast.error('Failed to respond to request');
        } finally {
            setRespondingId(null);
        }
    };

    const visibleRequests = useMemo(() => {
        if (filter === 'ALL') return requests;
        return requests.filter(r => r.status === filter);
    }, [requests, filter]);

    const pendingCount = useMemo(() => requests.filter(r => r.status === 'PENDING').length, [requests]);

    /* ── Access / loading gates ── */
    if (loadingAccess) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white text-slate-900">
                <p className="text-xl font-bold mb-4 text-slate-700">Project not found.</p>
                <Button onClick={() => navigate('/dashboard')} className="bg-indigo-600 hover:bg-indigo-700">Back to Dashboard</Button>
            </div>
        );
    }

    if (!isMember) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white text-slate-900 gap-4">
                <p className="text-xl font-bold text-slate-700">Only project members can view join requests.</p>
                <Button onClick={() => navigate(`/projects/${projectId}`)} className="bg-indigo-600 hover:bg-indigo-700">
                    Back to Project
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-slate-50 text-slate-900">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 px-6 flex items-center gap-4 bg-white sticky top-0 z-10">
                <button
                    aria-label="Back to project"
                    onClick={() => navigate(`/projects/${projectId}`)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                    <h1 className="font-bold text-lg text-slate-900 truncate">Join Requests &amp; Invitations</h1>
                    <p className="text-xs text-slate-400 truncate">{project.title}</p>
                </div>
                {pendingCount > 0 && (
                    <Badge className="ml-auto bg-amber-50 text-amber-700 border-amber-100 border text-[10px] font-bold uppercase tracking-wider shrink-0">
                        {pendingCount} pending
                    </Badge>
                )}
            </header>

            <main className="max-w-3xl mx-auto p-6 space-y-5">
                {/* Filter tabs */}
                <div className="flex items-center gap-2">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                                filter === f
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-700'
                            }`}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* List */}
                {loadingRequests ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    </div>
                ) : visibleRequests.length === 0 ? (
                    <Card className="p-10 bg-white border-slate-200 rounded-2xl flex flex-col items-center text-center gap-2">
                        <Inbox className="w-8 h-8 text-slate-300" />
                        <p className="text-sm font-bold text-slate-600">No {filter !== 'ALL' ? filter.toLowerCase() : ''} requests</p>
                        <p className="text-xs text-slate-400">Join requests from students and invitations you've sent will show up here.</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {visibleRequests.map(req => (
                            <RequestCard
                                key={req.id}
                                request={req}
                                isResponding={respondingId === req.id}
                                onRespond={handleRespond}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pageInfo.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg text-xs gap-1"
                            disabled={pageInfo.first || loadingRequests}
                            onClick={() => loadRequests(pageInfo.number - 1)}
                        >
                            <ChevronLeft size={14} /> Prev
                        </Button>
                        <span className="text-xs text-slate-400 font-semibold">
              Page {pageInfo.number + 1} of {pageInfo.totalPages}
            </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg text-xs gap-1"
                            disabled={pageInfo.last || loadingRequests}
                            onClick={() => loadRequests(pageInfo.number + 1)}
                        >
                            Next <ChevronRight size={14} />
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}

/* ─── REQUEST CARD ───────────────────────────────────────────────────────── */
function RequestCard({ request, isResponding, onRespond }) {
    const isInvitation = request.requestType === 'INVITATION';
    const typeMeta = TYPE_STYLE[request.requestType] || TYPE_STYLE.REQUEST;
    const isPending = request.status === 'PENDING';
    const personName = isInvitation ? request.targetUserName : request.initiatedByName;

    return (
        <Card className="p-4 bg-white border-slate-200 rounded-2xl flex items-center gap-4 hover:border-indigo-200 hover:shadow-sm transition-all">
            <Avatar className="w-11 h-11 border border-slate-200 shrink-0">
                <AvatarFallback className="bg-indigo-50 text-indigo-700 font-black text-sm">
                    {(isInvitation ? <Send size={16} /> : (personName?.[0] || 'U'))}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{personName || 'Unknown user'}</p>
                    <Badge className={`${typeMeta.className} border text-[10px] font-bold uppercase tracking-wider`}>
                        {typeMeta.label}
                    </Badge>
                    <Badge className={`${STATUS_STYLE[request.status] || 'bg-slate-50 text-slate-600 border-slate-100'} border text-[10px] font-bold uppercase tracking-wider`}>
                        {request.status}
                    </Badge>
                </div>
                {request.message && (
                    <p className="text-xs text-slate-500 truncate">"{request.message}"</p>
                )}
                <p className="text-[11px] text-slate-400 mt-0.5">
                    {isInvitation ? `Invited by ${request.initiatedByName || 'a member'}` : 'Wants to join this project'}
                    {' · '}{formatDate(request.createdAt)}
                </p>
            </div>

            {isPending ? (
                <div className="flex gap-2 shrink-0">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                        disabled={isResponding}
                        aria-label="Reject"
                        onClick={() => onRespond(request.id, 'REJECTED')}
                    >
                        {isResponding ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={isResponding}
                        aria-label="Accept"
                        onClick={() => onRespond(request.id, 'ACCEPTED')}
                    >
                        {isResponding ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    </Button>
                </div>
            ) : (
                <span className="text-[11px] text-slate-400 shrink-0">
          {request.respondedAt ? formatDate(request.respondedAt) : ''}
        </span>
            )}
        </Card>
    );
}