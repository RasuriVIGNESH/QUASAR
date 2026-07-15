import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

// Icons
import {
  LayoutDashboard, ClipboardList, Users, MessageSquare, Settings,
  Github, Globe, ArrowLeft, Plus, Send, CheckCircle2,
  Link as LinkIcon, Video, Flag, MoreHorizontal, Calendar,
  Edit, Loader2, Cpu, MoreVertical, Zap, ChevronDown, Pencil, Trash2, Inbox,
  X, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';

// Services
import projectService, { toArray } from '@/services/projectService';
import { teamService } from '@/services/TeamService';
import { chatService } from '@/services/Chatservice';
import MeetingRooms from './MeetingRooms';
import { toast } from 'sonner';

/* ─── STATIC CONSTANTS (outside component) ──────────────────────────────── */
const STATUS_BADGE_COLOR = {
  RECRUITING: 'bg-blue-50 text-blue-700 border-blue-100',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  CANCELLED: 'bg-red-50 text-red-700 border-red-100',
};

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function ProjectPage() {
  const { projectId } = useParams();
  const { userProfile, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [members, setMembers] = useState([]);
  const [teamLead, setTeamLead] = useState(null);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);
  const [completionLinks, setCompletionLinks] = useState({ githubRepo: '', demoUrl: '' });

  const loadData = useCallback(async () => {
    if (!projectId) return;
    try {
      const [projectData, membersRes] = await Promise.all([
        projectService.getProject(projectId),
        teamService.getProjectMembers(projectId)
      ]);
      setProject(projectData);
      const membersData = membersRes?.data ?? membersRes ?? {};
      setTeamLead(membersData.lead ?? null);
      const memberList = toArray(membersData.members ?? membersData);
      setMembers(memberList);
      if (projectData) {
        setCompletionLinks({
          githubRepo: projectData.githubRepo || '',
          demoUrl: projectData.demoUrl || ''
        });
      }
    } catch (err) {
      console.error('Project Load Error:', err);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadData(); }, [loadData]);

  const currentUserId = useMemo(() => userProfile?.id || currentUser?.id, [userProfile, currentUser]);
  const isProjectLead = useMemo(() => {
    if (!teamLead) return false;
    const leadId = teamLead.id ?? teamLead.userId;
    return String(currentUserId) === String(leadId);
  }, [teamLead, currentUserId]);
  const isMember = useMemo(() => {
    return isProjectLead || members.some(m => String(m.user?.id ?? m.userId ?? m.id) === String(currentUserId));
  }, [isProjectLead, members, currentUserId]);

  const NAV_TABS = useMemo(() => [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'rooms', icon: Video, label: 'Meeting Rooms' },
    { id: 'tasks', icon: ClipboardList, label: 'Tasks' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'team', icon: Users, label: 'Team' },
    ...(isMember ? [{ id: 'manage', icon: Settings, label: 'Settings' }] : [])
  ], [isMember]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'COMPLETED' && !project?.githubRepo && !project?.demoUrl) {
      setIsCompletionDialogOpen(true);
      return;
    }
    try {
      await projectService.updateProject(projectId, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      loadData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handlePurgeProject = async () => {
    setIsDeleting(true);
    try {
      await projectService.deleteProject(projectId);
      toast.success('Project deleted');
      navigate('/dashboard');
    } catch {
      toast.error('Delete failed');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleConfirmCompletion = async () => {
    setIsSubmittingCompletion(true);
    try {
      await projectService.updateProject(projectId, { status: 'COMPLETED', ...completionLinks });
      setIsCompletionDialogOpen(false);
      loadData();
      toast.success('Project marked as completed');
    } catch {
      toast.error('Failed to complete project');
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  if (loading) return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
  );

  if (!project) return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white text-slate-900">
        <p className="text-xl font-bold mb-4 text-slate-700">Project not found.</p>
        <Button onClick={() => navigate('/dashboard')} className="bg-indigo-600 hover:bg-indigo-700">Back to Dashboard</Button>
      </div>
  );

  return (
      <div className="h-screen w-full bg-white text-slate-900 flex overflow-hidden">

        {/* ── SIDEBAR NAV ── */}
        <aside className="w-16 lg:w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-8 z-50 shrink-0">
          <img
              src="/Logo.png"
              alt="Quasar"
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-xl object-cover shadow-md cursor-pointer hover:opacity-90 transition-opacity"
          />
          <nav className="flex flex-col gap-2 flex-1">
            {NAV_TABS.map((item) => (
                <TooltipProvider key={item.id}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                          aria-label={item.label}
                          onClick={() => setActiveTab(item.id)}
                          className={`p-3 rounded-xl transition-all ${activeTab === item.id
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                      >
                        <item.icon className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-slate-900 text-white text-xs">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            ))}
          </nav>
          <button
              aria-label="Go back"
              onClick={() => navigate(-1)}
              className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              <h1 className="font-bold text-lg text-slate-900 truncate">{project.title}</h1>
              <Badge className={`${STATUS_BADGE_COLOR[project.status] || 'bg-slate-50 text-slate-600'} border text-[10px] font-bold uppercase tracking-wider shrink-0`}>
                {project.status?.replace('_', ' ')}
              </Badge>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((m, i) => {
                  const memberId = m.user?.id ?? m.userId;
                  const isLead = m.role === 'LEAD' || String(memberId) === String(teamLead?.id ?? teamLead?.userId);
                  return (
                      <Avatar key={m.id || i} className={`w-7 h-7 border-2 border-white relative ${isLead ? 'ring-2 ring-amber-400' : ''}`}>
                        <AvatarImage src={m.user?.profilePictureUrl || m.profilePictureUrl} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-[10px] font-black">{(m.user?.firstName || m.firstName)?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                  );
                })}
                {members.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                      +{members.length - 4}
                    </div>
                )}
              </div>

              {isProjectLead && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1 rounded-lg">
                        Status <ChevronDown size={12} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 bg-white border-slate-200 text-slate-900">
                      <DropdownMenuLabel className="text-[10px] uppercase text-slate-400">Change Status</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleStatusChange('RECRUITING')} className="text-xs">Recruiting</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange('IN_PROGRESS')} className="text-xs">In Progress</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange('COMPLETED')} className="text-xs text-emerald-600">Completed</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStatusChange('CANCELLED')} className="text-xs text-red-500">Cancelled</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              )}

              {isMember && (
                  <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1 rounded-lg border-slate-200 text-slate-600 hover:text-indigo-700 hover:border-indigo-200"
                      onClick={() => navigate(`/projects/${projectId}/join-requests`)}
                  >
                    <Inbox size={14} /> Join Requests
                  </Button>
              )}

              {isMember && (
                  <Button
                      size="sm"
                      className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg"
                      onClick={() => navigate(`/projects/${projectId}/invite`)}
                  >
                    <Plus size={14} className="mr-1" /> Recruit
                  </Button>
              )}
            </div>
          </header>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50">
            <div className={activeTab === 'chat' ? 'h-full p-6 max-w-5xl mx-auto' : 'max-w-5xl mx-auto p-6'}>
              {activeTab === 'overview' && <OverviewTab project={project} members={members} />}
              {activeTab === 'rooms' && (
                  <div className="[&_*]:!text-slate-900 [&_*]:!bg-white [&_.dark]:!bg-white">
                    <MeetingRooms projectId={projectId} projectName={project.title} isProjectLead={isMember} />
                  </div>
              )}
              {activeTab === 'tasks' && <TaskBoard projectId={projectId} isProjectLead={isMember} />}
              {activeTab === 'chat' && <ChatSection projectId={projectId} currentUserId={currentUserId} />}
              {activeTab === 'team' && <TeamSection lead={teamLead} members={members} isProjectLead={isProjectLead} projectId={projectId} onUpdate={loadData} />}
              {activeTab === 'manage' && <SettingsTab project={project} isProjectLead={isProjectLead} onPurge={() => setIsDeleteDialogOpen(true)} onUpdate={loadData} />}
            </div>
          </div>
        </main>

        {/* ── COMPLETION DIALOG ── */}
        <Dialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
          <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Mark as Completed</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-slate-500">Add links to close the project lifecycle (optional).</p>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500">GitHub Repository</Label>
                <Input
                    placeholder="https://github.com/..."
                    value={completionLinks.githubRepo}
                    onChange={e => setCompletionLinks(prev => ({ ...prev, githubRepo: e.target.value }))}
                    className="rounded-xl border-slate-200 text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500">Live Demo URL</Label>
                <Input
                    placeholder="https://..."
                    value={completionLinks.demoUrl}
                    onChange={e => setCompletionLinks(prev => ({ ...prev, demoUrl: e.target.value }))}
                    className="rounded-xl border-slate-200 text-slate-900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCompletionDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button
                  onClick={handleConfirmCompletion}
                  disabled={isSubmittingCompletion}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                {isSubmittingCompletion ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {isSubmittingCompletion ? 'Saving...' : 'Confirm Completion'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── DELETE CONFIRMATION DIALOG ── */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-white border-slate-200 text-slate-900 rounded-2xl max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">Delete Project</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500">
                Are you sure you want to permanently delete <span className="font-semibold text-slate-700">"{project.title}"</span>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                  onClick={handlePurgeProject}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                {isDeleting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}

/* ─── OVERVIEW TAB ───────────────────────────────────────────────────────── */
const OverviewTab = memo(({ project, members }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Team Size', value: `${project.currentTeamSize ?? members.length}/${project.maxTeamSize || '—'}` },
          { label: 'Status', value: project.status?.replace('_', ' ') || '—' },
          { label: 'Category', value: project.category?.name || project.categoryName || '—' },
          { label: 'Created', value: project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
        ].map((stat, i) => (
            <Card key={i} className="p-4 bg-white border-slate-200 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-sm font-black text-slate-800 truncate">{stat.value}</p>
            </Card>
        ))}
      </div>

      <Card className="p-6 bg-white border-slate-200 rounded-2xl">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Description</h3>
        <p className="text-slate-700 leading-relaxed">{project.description || 'No description provided.'}</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-slate-200 rounded-2xl">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {project.techStack?.length
                ? project.techStack.map((tech, i) => (
                    <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">{tech}</span>
                ))
                : <span className="text-sm text-slate-400">Not specified</span>}
          </div>
        </Card>

        <Card className="p-6 bg-white border-slate-200 rounded-2xl">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {project.requiredSkills?.length
                ? project.requiredSkills.map((ps, i) => (
                    <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                {ps.skill?.name || ps}
              </span>
                ))
                : <span className="text-sm text-slate-400">Not specified</span>}
          </div>
        </Card>
      </div>

      {project.problemStatement && (
          <Card className="p-6 bg-indigo-50 border-indigo-100 rounded-2xl">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Flag size={14} /> Problem Statement
            </h4>
            <p className="text-slate-700 leading-relaxed">{project.problemStatement}</p>
          </Card>
      )}

      {(project.githubRepo || project.demoUrl) && (
          <div className="flex flex-wrap gap-3">
            {project.githubRepo && (
                <a
                    href={project.githubRepo.startsWith('http') ? project.githubRepo : `https://${project.githubRepo}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <Github size={16} /> GitHub
                </a>
            )}
            {project.demoUrl && (
                <a
                    href={project.demoUrl.startsWith('http') ? project.demoUrl : `https://${project.demoUrl}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:border-indigo-300 transition-colors"
                >
                  <Globe size={16} /> Live Demo
                </a>
            )}
          </div>
      )}
    </div>
));

/* ─── TASK BOARD ─────────────────────────────────────────────────────────── */
const TASK_COLUMNS = [
  { status: 'TODO', label: 'To Do', color: 'bg-slate-400' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-400' },
  { status: 'COMPLETED', label: 'Completed', color: 'bg-emerald-400' },
];

const TaskBoard = ({ projectId, isProjectLead }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO' });

  const fetchTasks = useCallback(async () => {
    try {
      const res = await projectService.getProjectTasks(projectId);
      setTasks(res?.data || res || []);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    setIsSubmitting(true);
    try {
      await projectService.createTask(projectId, newTask);
      toast.success('Task created');
      setIsAddOpen(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', status: 'TODO' });
      fetchTasks();
    } catch {
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const taskList = Array.isArray(tasks) ? tasks : [];

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Task Board</h2>
          {isProjectLead && (
              <Button
                  onClick={() => setIsAddOpen(true)}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-8 text-xs"
              >
                <Plus size={14} className="mr-1" /> Add Task
              </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {TASK_COLUMNS.map(col => {
            const colTasks = taskList.filter(t => (t.status || 'TODO') === col.status);
            return (
                <div key={col.status} className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200">
                    <div className={`w-2 h-2 rounded-full ${col.color}`} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{col.label}</span>
                    <span className="ml-auto text-xs font-black text-slate-400">{colTasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {loading
                        ? [1, 2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)
                        : colTasks.length === 0
                            ? <div className="h-20 flex items-center justify-center border border-dashed border-slate-200 rounded-xl">
                              <p className="text-xs text-slate-400">No tasks</p>
                            </div>
                            : colTasks.map(task => (
                                <Card key={task.id} className="p-4 bg-white border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all">
                                  <div className="flex justify-between items-start mb-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${task.priority === 'HIGH' ? 'bg-red-50 text-red-600' :
                              task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                                  'bg-slate-50 text-slate-500'
                          }`}>
                            {task.priority || 'LOW'}
                          </span>
                                  </div>
                                  <h4 className="text-sm font-bold text-slate-800 mb-1 leading-snug">{task.title}</h4>
                                  {task.description && <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>}
                                </Card>
                            ))
                    }
                  </div>
                </div>
            );
          })}
        </div>

        {/* Add Task Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500">Title</Label>
                <Input
                    placeholder="Task title..."
                    value={newTask.title}
                    onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="rounded-xl border-slate-200 text-slate-900 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500">Description</Label>
                <Textarea
                    placeholder="What needs to be done?"
                    value={newTask.description}
                    onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="rounded-xl border-slate-200 text-slate-900 min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Priority</Label>
                  <select
                      value={newTask.priority}
                      onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-slate-900 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Status</Label>
                  <select
                      value={newTask.status}
                      onChange={e => setNewTask(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-slate-900 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button>
              <Button
                  onClick={handleAddTask}
                  disabled={isSubmitting || !newTask.title.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

const ChatSection = ({ projectId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const scrollRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatService.getRecentMessages(projectId);
      setMessages(res?.data || res || []);
    } catch { /* silent */ }
  }, [projectId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!msg.trim() || sending) return;
    const text = msg;
    setMsg('');
    setSending(true);
    try {
      await chatService.sendMessage(projectId, text);
      fetchMessages();
    } catch {
      toast.error('Failed to send message');
      setMsg(text);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId) => {
    const prev = messages;
    setMessages(m => m.filter(x => x.id !== messageId));
    try {
      await chatService.deleteMessage(messageId);
    } catch {
      toast.error('Failed to delete message');
      setMessages(prev);
    }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditText(m.message);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (messageId) => {
    if (!editText.trim()) return;
    const prev = messages;
    setMessages(m => m.map(x => x.id === messageId ? { ...x, message: editText.trim() } : x));
    setEditingId(null);
    try {
      await chatService.editMessage(messageId, editText.trim());
      fetchMessages();
    } catch {
      toast.error('Failed to edit message');
      setMessages(prev);
    }
  };

  return (
      <div
          className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden"
          style={{ height: 'calc(100vh - 220px)' }}
      >
        <div className="px-5 py-4 border-b border-slate-100 bg-white shrink-0">
          <h2 className="text-sm font-black text-slate-700">Project Chat</h2>
        </div>

        <div ref={scrollRef} className="flex-1 p-5 space-y-4 overflow-y-auto">
          {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No messages yet. Start the conversation!
              </div>
          )}
          {messages.map(m => {
            const isMe = String(m.sender?.id) === String(currentUserId);
            const isEditing = editingId === m.id;
            return (
                <div key={m.id} className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {!isMe && (
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={m.sender?.profilePictureUrl} />
                          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-[8px] font-bold">{m.sender?.firstName?.[0]}</AvatarFallback>
                        </Avatar>
                    )}
                    <span className="text-[10px] font-bold text-slate-400">{m.sender?.firstName}</span>
                    <span className="text-[10px] text-slate-300">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                  </div>

                  {isEditing ? (
                      <div className="flex gap-2 items-center max-w-sm w-full">
                        <input
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEdit(m.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            autoFocus
                            className="flex-1 text-sm px-3 py-2 rounded-xl border border-indigo-300 outline-none"
                        />
                        <button onClick={() => saveEdit(m.id)} className="text-indigo-600 text-xs font-bold">Save</button>
                        <button onClick={cancelEdit} className="text-slate-400 text-xs">Cancel</button>
                      </div>
                  ) : (
                      <div className="flex items-center gap-1.5">
                        {isMe && (
                            <div className="hidden group-hover:flex gap-1.5 text-slate-300">
                              <button onClick={() => startEdit(m)} className="hover:text-indigo-500" title="Edit">
                                <Pencil size={12} />
                              </button>
                              <button onClick={() => handleDelete(m.id)} className="hover:text-red-500" title="Delete">
                                <Trash2 size={12} />
                              </button>
                            </div>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-sm leading-relaxed ${isMe ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                          {m.message}
                        </div>
                      </div>
                  )}
                </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <div className="flex gap-2 items-center bg-slate-50 rounded-xl border border-slate-200 px-4 py-2 focus-within:border-indigo-300 transition-colors">
            <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
                onClick={handleSend}
                disabled={!msg.trim() || sending}
                className="p-1.5 text-indigo-600 hover:text-indigo-700 disabled:opacity-30 transition-colors"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
  );
};
/* ─── TEAM SECTION ───────────────────────────────────────────────────────── */
const JoinRequestsPanel = ({ projectId, pageSize = 20 }) => {
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(false);
    projectService.getJoinRequests(projectId, {
      page,
      size: pageSize,
    })
        .then(res => { if (!cancelled) setPageData(res?.data ?? res); })
        .catch(() => { if (!cancelled) setError(true); })
        .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [projectId, page, pageSize]);

  const items = pageData?.content || [];
  const totalPages = pageData?.totalPages || 0;

  const STATUS_COLOR = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    REJECTED: 'bg-red-50 text-red-700 border-red-100',
    CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
      <Card className="absolute right-0 top-[calc(100%+8px)] z-40 w-[360px] max-h-[420px] flex flex-col bg-white border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-sm font-bold text-slate-800">Invitations & Requests</p>
          {pageData && (
              <span className="text-[10px] text-slate-400 font-semibold">{pageData.totalElements ?? items.length} total</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
              </div>
          )}

          {!isLoading && error && (
              <p className="text-xs text-red-500 text-center py-8 px-4">Failed to load invitations & requests.</p>
          )}

          {!isLoading && !error && items.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8 px-4">No invitations or requests yet.</p>
          )}

          {!isLoading && !error && items.map(item => (
              <div key={item.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.requestType === 'INVITATION' ? 'Invitation' : 'Join Request'}
                  </span>
                  <Badge className={`${STATUS_COLOR[item.status] || 'bg-slate-50 text-slate-600 border-slate-100'} border text-[9px] font-bold uppercase tracking-wider`}>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-700">
                  <span className="font-semibold">{item.initiatedByName}</span>
                  {' → '}
                  <span className="font-semibold">{item.targetUserName}</span>
                </p>
                {item.message && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.message}</p>
                )}
                {item.createdAt && (
                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <Clock size={10} /> {new Date(item.createdAt).toLocaleString()}
                    </p>
                )}
              </div>
          ))}
        </div>

        {totalPages > 1 && (
            <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between shrink-0">
              <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[10px] text-slate-400 font-semibold">Page {page + 1} of {totalPages}</span>
              <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <ChevronRight size={16} />
              </button>
            </div>
        )}
      </Card>
  );
};

const TeamSection = memo(({ lead, members, isProjectLead, projectId, onUpdate }) => {
  const [removingId, setRemovingId] = useState(null);
  const [promotingId, setPromotingId] = useState(null);

  const handleRemove = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from the project?`)) return;
    setRemovingId(memberId);
    try {
      await teamService.removeMemberFromProject(projectId, memberId);
      toast.success(`${memberName} removed`);
      onUpdate();
    } catch {
      toast.error('Failed to remove member');
    } finally {
      setRemovingId(null);
    }
  };

  const handleMakeLead = async (memberUserId, memberName) => {
    if (!window.confirm(`Make ${memberName} the project lead? You will become a member.`)) return;
    setPromotingId(memberUserId);
    try {
      await teamService.updateProjectLead(projectId, memberUserId);
      toast.success(`${memberName} is now the project lead`);
      onUpdate();
    } catch {
      toast.error('Failed to update project lead');
    } finally {
      setPromotingId(null);
    }
  };

  // Person cards can come from the "lead" object (flat: {id, firstName, ...})
  // or from a "member" object (may be flat, or nested under m.user).
  const getPerson = (m) => ({
    id: m.user?.id ?? m.userId ?? m.id,
    memberId: m.id,
    firstName: m.user?.firstName || m.firstName || '',
    lastName: m.user?.lastName || m.lastName || '',
    branch: m.user?.branch || m.branch || '',
    profilePictureUrl: m.user?.profilePictureUrl || m.profilePictureUrl || '',
  });

  // Build the full roster: lead first, then everyone else in `members`
  // that isn't already the lead (the API's `members` array includes the lead too).
  const leadPerson = lead ? getPerson(lead) : null;
  const otherMembers = members.filter(m => {
    const p = getPerson(m);
    return !leadPerson || String(p.id) !== String(leadPerson.id);
  });
  const totalCount = (leadPerson ? 1 : 0) + otherMembers.length;

  const PersonCard = ({ person, role, canManage }) => {
    const isBusy = removingId === person.memberId || promotingId === person.id;
    return (
        <Card className="p-4 bg-white border-slate-200 rounded-2xl flex items-center gap-4 hover:border-indigo-200 hover:shadow-sm transition-all">
          <Avatar className={`w-11 h-11 border shrink-0 ${role === 'LEAD' ? 'border-amber-300 ring-2 ring-amber-200' : 'border-slate-200'}`}>
            <AvatarImage src={person.profilePictureUrl} />
            <AvatarFallback className="bg-indigo-50 text-indigo-700 font-black text-sm">{person.firstName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {person.firstName} {person.lastName}
            </p>
            <p className="text-xs text-slate-400 truncate">{person.branch}</p>
            <p className={`text-xs font-semibold mt-0.5 ${role === 'LEAD' ? 'text-amber-600' : 'text-indigo-600'}`}>
              {role === 'LEAD' ? 'Project Lead' : 'Member'}
            </p>
          </div>
          {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                      disabled={isBusy}
                      className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors shrink-0"
                      aria-label={`Manage ${person.firstName}`}
                  >
                    {isBusy ? <Loader2 size={14} className="animate-spin" /> : <MoreVertical size={14} />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-white border-slate-200 text-slate-900">
                  <DropdownMenuItem
                      onClick={() => handleMakeLead(person.id, person.firstName)}
                      className="text-xs text-amber-600"
                  >
                    Make Lead
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                      onClick={() => handleRemove(person.memberId, person.firstName)}
                      className="text-xs text-red-500"
                  >
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          )}
        </Card>
    );
  };

  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-900">Team Members</h2>
            <span className="text-xs text-slate-400 font-semibold">{totalCount} member{totalCount !== 1 ? 's' : ''}</span>
          </div>

          {/* Invite / Join Requests — visible to everyone */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leadPerson && (
              <PersonCard person={leadPerson} role="LEAD" canRemove={false} />
          )}
          {otherMembers.map(m => (
              <PersonCard
                  key={m.id}
                  person={getPerson(m)}
                  role={m.role || 'MEMBER'}
                  canManage={isProjectLead && m.role !== 'LEAD'}
              />
          ))}
          {totalCount === 0 && (
              <p className="text-sm text-slate-400 col-span-3">No team members yet.</p>
          )}
        </div>
      </div>
  );
});

/* ─── SETTINGS TAB ───────────────────────────────────────────────────────── */
const SettingsTab = ({ project, isProjectLead, onPurge, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: project.title || '',
    description: project.description || '',
    categoryId: project.category?.id || '',
    categoryName: project.category?.name || project.categoryName || '',
    techStack: project.techStack || [],
    skills: project.requiredSkills?.map(ps => ({
      skillId: ps.skill?.id || ps.id || '',
      skillName: ps.skill?.name || ps,
      proficiencyLevel: ps.proficiencyLevel || 'BEGINNER',
    })) || [],
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [categoryInput, setCategoryInput] = useState(
      project.category?.name || project.categoryName || ''
  );
  const [techInput, setTechInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skillLevel, setSkillLevel] = useState('BEGINNER');

  const [projectCategories, setProjectCategories] = useState([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    projectService.getProjectCategories()
        .then(res => setProjectCategories(Array.isArray(res) ? res : (res?.data || [])))
        .catch(() => { });
  }, []);

  const handleUpdate = async () => {
    if (!formData.title.trim()) { toast.error('Title cannot be empty'); return; }
    setIsUpdating(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        techStack: formData.techStack,
        skills: formData.skills.map(s => ({
          skillId: s.skillId || undefined,
          skillName: s.skillName,
          proficiencyLevel: s.proficiencyLevel,
        })),
        ...(formData.categoryId
            ? { categoryId: Number(formData.categoryId) }
            : { categoryName: categoryInput.trim() }),
      };
      await projectService.updateProject(project.id, payload);
      toast.success('Project updated');
      onUpdate();
    } catch {
      toast.error('Failed to update project');
    } finally {
      setIsUpdating(false);
    }
  };

  const addTech = () => {
    const val = techInput.trim();
    if (!val || formData.techStack.includes(val)) return;
    setFormData(prev => ({ ...prev, techStack: [...prev.techStack, val] }));
    setTechInput('');
  };

  const removeTech = (tech) =>
      setFormData(prev => ({ ...prev, techStack: prev.techStack.filter(t => t !== tech) }));

  const addSkill = () => {
    const val = skillInput.trim();
    if (!val || formData.skills.some(s => s.skillName.toLowerCase() === val.toLowerCase())) return;
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { skillId: '', skillName: val, proficiencyLevel: skillLevel }],
    }));
    setSkillInput('');
    setSkillLevel('BEGINNER');
  };

  const removeSkill = (name) =>
      setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s.skillName !== name) }));

  return (
      <div className="max-w-3xl space-y-6">
        <h2 className="text-xl font-black text-slate-900">Project Settings</h2>

        <Card className="p-6 bg-white border-slate-200 rounded-2xl">
          <div className="grid grid-cols-2 gap-5">

            {/* Title */}
            <div className="col-span-2 space-y-2">
              <Label className="text-xs font-bold text-slate-500">Project Title</Label>
              <Input
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="h-11 rounded-xl border-slate-200 text-slate-900"
              />
            </div>

            {/* Description */}
            <div className="col-span-2 space-y-2">
              <Label className="text-xs font-bold text-slate-500">Description</Label>
              <Textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="rounded-xl border-slate-200 text-slate-900 min-h-[90px] resize-none"
              />
            </div>

            {/* Category */}
            <div className="col-span-2 space-y-2">
              <Label className="text-xs font-bold text-slate-500">Category</Label>
              <div className="flex gap-2">
                <select
                    value={formData.categoryId || ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'create_new') {
                        setShowCategoryDialog(true);
                        return;
                      }
                      const selected = projectCategories.find(c => String(c.id) === val);
                      setFormData(prev => ({ ...prev, categoryId: val, categoryName: selected?.name || '' }));
                      setCategoryInput(selected?.name || '');
                    }}
                    className="flex-1 h-11 px-3 rounded-xl border border-slate-200 text-slate-900 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select category…</option>
                  {projectCategories.map(cat => (
                      <option key={cat.id} value={String(cat.id)}>{cat.name.replace(/^in\s+/i, '')}</option>
                  ))}
                  <option value="create_new">+ Add New Category</option>
                </select>
                {formData.categoryId && (
                    <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, categoryId: '', categoryName: '' }));
                          setCategoryInput('');
                        }}
                        className="px-3 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl text-sm"
                    >
                      Clear
                    </button>
                )}
              </div>
              {/* Fallback: show current category name if not in list */}
              {!formData.categoryId && categoryInput && (
                  <p className="text-[11px] text-slate-400">
                    Current: <span className="font-semibold text-slate-600">{categoryInput}</span> — select from list to update
                  </p>
              )}
            </div>

            {/* Tech Stack — left col */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500">Tech Stack</Label>
              <div className="flex gap-2">
                <Input
                    placeholder="e.g. React, Kafka…"
                    value={techInput}
                    onChange={e => setTechInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())}
                    className="h-10 rounded-xl border-slate-200 text-slate-900 text-sm flex-1"
                />
                <button
                    type="button"
                    onClick={addTech}
                    className="h-10 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="min-h-[60px] flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                {formData.techStack.length === 0 && (
                    <span className="text-xs text-slate-400 self-center">No tech added yet</span>
                )}
                {formData.techStack.map(tech => (
                    <span
                        key={tech}
                        className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100"
                    >
                  {tech}
                      <button
                          type="button"
                          onClick={() => removeTech(tech)}
                          className="text-indigo-400 hover:text-indigo-700 leading-none ml-0.5"
                      >×</button>
                </span>
                ))}
              </div>
            </div>

            {/* Required Skills — right col */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500">Required Skills</Label>
              <div className="flex gap-2">
                <Input
                    placeholder="e.g. Docker, JWT…"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="h-10 rounded-xl border-slate-200 text-slate-900 text-sm flex-1"
                />
                <select
                    value={skillLevel}
                    onChange={e => setSkillLevel(e.target.value)}
                    className="h-10 px-2 rounded-xl border border-slate-200 text-slate-900 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="VIBE_CODING">VIBE_CODING</option>
                </select>
                <button
                    type="button"
                    onClick={addSkill}
                    className="h-10 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="min-h-[60px] flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                {formData.skills.length === 0 && (
                    <span className="text-xs text-slate-400 self-center">No skills added yet</span>
                )}
                {formData.skills.map(s => (
                    <span
                        key={s.skillName}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100"
                    >
                  {s.skillName}
                      <span className="text-emerald-400 font-normal">
                    · {s.proficiencyLevel.charAt(0) + s.proficiencyLevel.slice(1).toLowerCase()}
                  </span>
                  <button
                      type="button"
                      onClick={() => removeSkill(s.skillName)}
                      className="text-emerald-400 hover:text-emerald-700 leading-none ml-0.5"
                  >×</button>
                </span>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="col-span-2 flex justify-end pt-2">
              <Button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8"
              >
                {isUpdating ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {isUpdating ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>

          </div>
        </Card>

        {/* Danger Zone — lead only */}
        {isProjectLead && (
            <div className="p-5 border border-red-200 bg-red-50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-red-700 font-bold text-sm">Danger Zone</h4>
                <p className="text-xs text-red-500 mt-1">Permanently delete this project. This cannot be undone.</p>
              </div>
              <Button
                  onClick={onPurge}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-600 hover:text-white rounded-xl shrink-0"
              >
                Delete Project
              </Button>
            </div>
        )}

        {/* Add Category Dialog */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">New Category</DialogTitle>
            </DialogHeader>
            <div className="py-3">
              <Input
                  placeholder="e.g. AI/ML, Fintech…"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                  className="rounded-xl border-slate-200 text-slate-900 h-11"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                  onClick={async () => {
                    if (!newCategoryName.trim()) return;
                    try {
                      await projectService.createProjectCategory({ name: newCategoryName.trim() });
                      const cats = await projectService.getProjectCategories();
                      const categoriesList = Array.isArray(cats) ? cats : (cats?.data || []);
                      setProjectCategories(categoriesList);

                      const createdCat = categoriesList.find(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase());
                      if (createdCat) {
                        setFormData(prev => ({ ...prev, categoryId: String(createdCat.id), categoryName: createdCat.name }));
                        setCategoryInput(createdCat.name);
                      }
                      setShowCategoryDialog(false);
                      setNewCategoryName('');
                      toast.success('Category created');
                    } catch {
                      toast.error('Failed to create category');
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};