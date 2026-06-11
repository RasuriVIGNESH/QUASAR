import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  Edit, Loader2, Cpu, MoreVertical, Zap, ChevronDown
} from 'lucide-react';

// Services — all backend calls through service layer
import { projectService } from '../../services/projectService.js';
import { chatService } from '../../services/Chatservice.js';
import MeetingRooms from './MeetingRooms';
import { toast } from 'sonner';

export default function ProjectPage() {
  const { projectId } = useParams();
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [members, setMembers] = useState([]);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [completionLinks, setCompletionLinks] = useState({ githubRepo: '', demoUrl: '' });

  const loadData = useCallback(async () => {
    if (!projectId) return;
    try {
      const [projectData, membersRes] = await Promise.all([
        projectService.getProject(projectId),
        projectService.getProjectMembers(projectId)
      ]);

      setProject(projectData);
      const memberList = membersRes?.data || membersRes || [];
      setMembers(Array.isArray(memberList) ? memberList : (memberList.content || []));

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

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'COMPLETED' && !project?.githubRepo && !project?.demoUrl) {
      setIsCompletionDialogOpen(true);
      return;
    }
    try {
      await projectService.updateProject(projectId, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      loadData();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handlePurgeProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectService.deleteProject(projectId);
      toast.success('Project deleted');
      navigate('/dashboard');
    } catch (e) {
      toast.error('Delete failed');
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

  const currentUserId = userProfile?.id || currentUser?.id;
  const isProjectLead = String(currentUserId) === String(project?.lead?.id || project?.lead);
  const isMember = members.some(m => String(m.user?.id || m.userId) === String(currentUserId)) || isProjectLead;

  const NAV_TABS = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'rooms', icon: Video, label: 'Meeting Rooms' },
    { id: 'tasks', icon: ClipboardList, label: 'Tasks' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'team', icon: Users, label: 'Team' },
    ...(isMember ? [{ id: 'manage', icon: Settings, label: 'Settings' }] : [])
  ];

  const statusBadgeColor = {
    RECRUITING: 'bg-blue-50 text-blue-700 border-blue-100',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    CANCELLED: 'bg-red-50 text-red-700 border-red-100',
  };

  return (
    <div className="h-screen w-full bg-white text-slate-900 flex overflow-hidden">

      {/* SIDEBAR NAV */}
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

        <button onClick={() => navigate(-1)} className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <h1 className="font-bold text-lg text-slate-900 truncate">{project.title}</h1>
            <Badge className={`${statusBadgeColor[project.status] || 'bg-slate-50 text-slate-600'} border text-[10px] font-bold uppercase tracking-wider shrink-0`}>
              {project.status?.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex -space-x-2">
              {members.slice(0, 4).map((m, i) => (
                <Avatar key={i} className="w-7 h-7 border-2 border-white">
                  <AvatarImage src={m.user?.profilePictureUrl} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 text-[10px] font-black">{m.user?.firstName?.[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>

            {isProjectLead && (
              <>
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

                <Button
                  size="sm"
                  className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg"
                  onClick={() => navigate(`/projects/${projectId}/invite`)}
                >
                  <Plus size={14} className="mr-1" /> Recruit
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-5xl mx-auto p-6">
            {activeTab === 'overview' && <OverviewTab project={project} members={members} />}
            {activeTab === 'rooms' && <MeetingRooms projectId={projectId} projectName={project.title} isProjectLead={isProjectLead} />}
            {activeTab === 'tasks' && <TaskBoard projectId={projectId} />}
            {activeTab === 'chat' && <ChatSection projectId={projectId} currentUserId={currentUserId} />}
            {activeTab === 'team' && <TeamSection members={members} />}
            {activeTab === 'manage' && <SettingsTab project={project} onPurge={handlePurgeProject} onUpdate={loadData} />}
          </div>
        </div>
      </main>

      {/* Completion Dialog */}
      <Dialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Mark as Completed</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-500">Add links to close the project lifecycle (optional).</p>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500">GitHub Repository</Label>
              <Input placeholder="https://github.com/..." value={completionLinks.githubRepo} onChange={e => setCompletionLinks({ ...completionLinks, githubRepo: e.target.value })} className="rounded-xl border-slate-200 text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500">Live Demo URL</Label>
              <Input placeholder="https://..." value={completionLinks.demoUrl} onChange={e => setCompletionLinks({ ...completionLinks, demoUrl: e.target.value })} className="rounded-xl border-slate-200 text-slate-900" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompletionDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button
              onClick={async () => {
                try {
                  await projectService.updateProject(projectId, { status: 'COMPLETED', ...completionLinks });
                  setIsCompletionDialogOpen(false);
                  loadData();
                  toast.success('Project marked as completed');
                } catch (e) {
                  toast.error('Failed to complete project');
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
            >
              Confirm Completion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── OVERVIEW TAB ────────────────────────────────────────────────────── */
const OverviewTab = memo(({ project, members }) => (
  <div className="space-y-6">
    {/* Stats row */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[
        { label: 'Team Size', value: `${members.length}/${project.maxTeamSize}` },
        { label: 'Status', value: project.status?.replace('_', ' ') || '—' },
        { label: 'Category', value: project.category?.name || project.category || '—' },
        { label: 'Created', value: project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
      ].map((stat, i) => (
        <Card key={i} className="p-4 bg-white border-slate-200 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
          <p className="text-sm font-black text-slate-800 truncate">{stat.value}</p>
        </Card>
      ))}
    </div>

    {/* Description */}
    <Card className="p-6 bg-white border-slate-200 rounded-2xl">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Description</h3>
      <p className="text-slate-700 leading-relaxed">{project.description}</p>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tech Stack */}
      <Card className="p-6 bg-white border-slate-200 rounded-2xl">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Tech Stack</h3>
        <div className="flex flex-wrap gap-2">
          {project.techStack?.length ? project.techStack.map((tech, i) => (
            <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">{tech}</span>
          )) : <span className="text-sm text-slate-400">Not specified</span>}
        </div>
      </Card>

      {/* Required Skills */}
      <Card className="p-6 bg-white border-slate-200 rounded-2xl">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Required Skills</h3>
        <div className="flex flex-wrap gap-2">
          {project.requiredSkills?.length ? project.requiredSkills.map((ps, i) => (
            <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">{ps.skill?.name || ps}</span>
          )) : <span className="text-sm text-slate-400">Not specified</span>}
        </div>
      </Card>
    </div>

    {/* Problem Statement */}
    {project.problemStatement && (
      <Card className="p-6 bg-indigo-50 border-indigo-100 rounded-2xl">
        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Flag size={14} /> Problem Statement
        </h4>
        <p className="text-slate-700 leading-relaxed">{project.problemStatement}</p>
      </Card>
    )}

    {/* Links */}
    {(project.githubRepo || project.demoUrl) && (
      <div className="flex flex-wrap gap-3">
        {project.githubRepo && (
          <a href={project.githubRepo} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors">
            <Github size={16} /> GitHub
          </a>
        )}
        {project.demoUrl && (
          <a href={project.demoUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:border-indigo-300 transition-colors">
            <Globe size={16} /> Live Demo
          </a>
        )}
      </div>
    )}
  </div>
));

/* ─── TASK BOARD ──────────────────────────────────────────────────────── */
const TaskBoard = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService.getProjectTasks(projectId)
      .then(res => setTasks(res?.data || res || []))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const columns = [
    { status: 'TODO', label: 'To Do', color: 'bg-slate-400' },
    { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-400' },
    { status: 'COMPLETED', label: 'Completed', color: 'bg-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-slate-900">Task Board</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {columns.map(col => {
          const colTasks = (Array.isArray(tasks) ? tasks : []).filter(t => (t.status || 'TODO') === col.status);
          return (
            <div key={col.status} className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{col.label}</span>
                <span className="ml-auto text-xs font-black text-slate-400">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {loading ? (
                  [1, 2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)
                ) : colTasks.map(task => (
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
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── CHAT SECTION ────────────────────────────────────────────────────── */
const ChatSection = ({ projectId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const scrollRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatService.getRecentMessages(projectId);
      setMessages(res?.data || res || []);
    } catch { /* silent */ }
  }, [projectId]);

  useEffect(() => {
    fetchMessages();
    // Poll every 8s (reduced from 4s for performance)
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!msg.trim()) return;
    const text = msg;
    setMsg('');
    try {
      await chatService.sendMessage(projectId, text);
      fetchMessages();
    } catch {
      toast.error('Failed to send message');
      setMsg(text);
    }
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
      <div className="px-5 py-4 border-b border-slate-100 bg-white">
        <h2 className="text-sm font-black text-slate-700">Project Chat</h2>
      </div>
      <div ref={scrollRef} className="flex-1 p-5 space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">No messages yet. Start the conversation!</div>
        )}
        {messages.map(m => {
          const isMe = String(m.sender?.id) === String(currentUserId);
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-400">{m.sender?.firstName}</span>
                <span className="text-[10px] text-slate-300">{new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-sm leading-relaxed ${isMe ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'
                }`}>
                {m.content}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2 items-center bg-slate-50 rounded-xl border border-slate-200 px-4 py-2 focus-within:border-indigo-300 transition-colors">
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <button onClick={handleSend} disabled={!msg.trim()} className="p-1.5 text-indigo-600 hover:text-indigo-700 disabled:opacity-30 transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── TEAM SECTION ────────────────────────────────────────────────────── */
const TeamSection = memo(({ members }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-black text-slate-900">Team Members</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map(m => (
        <Card key={m.id} className="p-4 bg-white border-slate-200 rounded-2xl flex items-center gap-4 hover:border-indigo-200 hover:shadow-sm transition-all">
          <Avatar className="w-11 h-11 border border-slate-200">
            <AvatarImage src={m.user?.profilePictureUrl} />
            <AvatarFallback className="bg-indigo-50 text-indigo-700 font-black text-sm">{m.user?.firstName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{m.user?.firstName} {m.user?.lastName}</p>
            <p className="text-xs text-indigo-600 font-semibold">{m.role || 'Member'}</p>
          </div>
        </Card>
      ))}
      {members.length === 0 && <p className="text-sm text-slate-400 col-span-3">No team members yet.</p>}
    </div>
  </div>
));

/* ─── SETTINGS TAB ────────────────────────────────────────────────────── */
const SettingsTab = ({ project, onPurge, onUpdate }) => {
  const [formData, setFormData] = useState({ title: project.title, description: project.description });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await projectService.updateProject(project.id, formData);
      toast.success('Project updated');
      onUpdate();
    } catch {
      toast.error('Failed to update project');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-black text-slate-900">Project Settings</h2>
      <Card className="p-6 bg-white border-slate-200 rounded-2xl space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500">Project Title</Label>
          <Input
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="rounded-xl border-slate-200 text-slate-900 h-11"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500">Description</Label>
          <Textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="rounded-xl border-slate-200 text-slate-900 min-h-[100px]"
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={handleUpdate} disabled={isUpdating} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6">
            {isUpdating ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      <div className="p-5 border border-red-200 bg-red-50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-red-700 font-bold text-sm">Danger Zone</h4>
          <p className="text-xs text-red-500 mt-1">Permanently delete this project. This cannot be undone.</p>
        </div>
        <Button onClick={onPurge} variant="outline" className="border-red-300 text-red-600 hover:bg-red-600 hover:text-white rounded-xl shrink-0">
          Delete Project
        </Button>
      </div>
    </div>
  );
};
