import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

// Icons
import {
  LayoutDashboard, ClipboardList, Users, MessageSquare, Settings,
  Github, Globe, ArrowLeft, Plus, Send, Sparkles,
  CheckCircle2, Zap, Link as LinkIcon, Trash2, Video,
  Search, Flag, Layers, MoreHorizontal, Calendar, Tag, Edit, LogOut, Loader2, Target, Cpu
} from 'lucide-react';

// Services
import { projectService } from '../../services/projectService.js';
import { chatService } from '../../services/Chatservice.js';
import MeetingRooms from './MeetingRooms';

/* ─── DESIGN TOKENS ──────────────────────────────────────────────────────── */
const THEME = {
  bg: '#020617',
  surface: '#0B1120',
  indigo: '#818CF8',
  cyan: '#22D3EE',
  border: 'rgba(255,255,255,0.05)'
};

export default function ProjectPage() {
  const { projectId } = useParams();
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [members, setMembers] = useState([]);

  // Status Management
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [completionLinks, setCompletionLinks] = useState({ githubRepo: '', demoUrl: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectData, membersData] = await Promise.all([
          projectService.getProject(projectId),
          projectService.getProjectMembers(projectId)
        ]);
        setProject(projectData);
        setMembers(membersData.data?.content || membersData.data || []);
        if (projectData) {
          setCompletionLinks({ githubRepo: projectData.githubRepo || '', demoUrl: projectData.demoUrl || '' });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadData();
  }, [projectId]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'COMPLETED' && !project.githubRepo && !project.demoUrl) {
      setIsCompletionDialogOpen(true);
      return;
    }
    try {
      await projectService.updateProject(projectId, { status: newStatus });
      window.location.reload();
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#020617]">
      <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
    </div>
  );

  const currentUserId = userProfile?.id || currentUser?.id;
  const isProjectLead = String(currentUserId) === String(project?.lead?.id || project?.lead);
  const isMember = members.some(m => String(m.user?.id) === String(currentUserId)) || isProjectLead;

  return (
    <div className="h-screen w-full bg-[#020617] text-slate-200 flex overflow-hidden" style={{ fontFamily: '"Outfit", sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400;1,500;1,600&family=Outfit:wght@300;400;500;700;900&display=swap');
        .glass-sidebar { background: rgba(11, 17, 32, 0.8); backdrop-filter: blur(20px); border-right: 1px solid rgba(255,255,255,0.05); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* --- QUASAR NAVIGATION --- */}
      <aside className="w-20 glass-sidebar flex flex-col items-center py-8 gap-10 z-50">
        <div
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 cursor-pointer hover:scale-110 transition-transform"
        >
          <Zap size={22} className="text-white fill-white" />
        </div>

        <nav className="flex flex-col gap-5">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'rooms', icon: Video, label: 'Comms' },
            { id: 'tasks', icon: ClipboardList, label: 'Board' },
            { id: 'chat', icon: MessageSquare, label: 'Relay' },
            { id: 'team', icon: Users, label: 'Peers' },
            ...(isMember ? [{ id: 'manage', icon: Settings, label: 'Logic' }] : [])
          ].map((item) => (
            <TooltipProvider key={item.id}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`p-3.5 rounded-2xl transition-all relative ${activeTab === item.id
                      ? 'bg-white/10 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {activeTab === item.id && (
                      <motion.div layoutId="nav-glow" className="absolute -left-2 top-1/4 bottom-1/4 w-1 bg-cyan-400 rounded-full blur-[2px]" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-900 border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-1.5">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>

        <button onClick={() => navigate(-1)} className="mt-auto p-3 text-slate-600 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </aside>

      {/* --- MAIN CORE --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_50%_-20%,rgba(129,140,248,0.05)_0%,transparent_70%)]">

        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <h1 className="font-serif italic text-2xl text-white tracking-tight">{project.title}</h1>
            <Badge className="bg-white/5 text-white/40 border-white/10 text-[9px] font-black uppercase tracking-[0.2em] px-3">
              {project.status?.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {members.slice(0, 3).map((m, i) => (
                <Avatar key={i} className="w-8 h-8 border-2 border-[#020617] shadow-lg">
                  <AvatarImage src={m.user?.profilePictureUrl} />
                  <AvatarFallback className="bg-slate-800 text-[10px] text-indigo-400 font-black">{m.user?.firstName?.[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <button
              onClick={() => navigate(`/projects/${projectId}/invite`)}
              className="bg-white text-black px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-lg shadow-white/5"
            >
              + Recruit
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full max-w-5xl mx-auto"
            >
              {activeTab === 'overview' && <OverviewTab project={project} isProjectLead={isProjectLead} projectId={projectId} />}
              {activeTab === 'rooms' && <MeetingRooms projectId={projectId} projectName={project.title} isProjectLead={isProjectLead} />}
              {activeTab === 'tasks' && <TaskBoard projectId={projectId} project={project} />}
              {activeTab === 'chat' && <ChatSection projectId={projectId} />}
              {activeTab === 'team' && <TeamSection projectId={projectId} project={project} />}
              {activeTab === 'manage' && <SettingsTab project={project} projectId={projectId} isProjectLead={isProjectLead} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* --- RIGHT TELEMETRY SIDEBAR --- */}
      <aside className="w-80 border-l border-white/5 bg-[#0B1120]/30 p-8 hidden xl:flex flex-col gap-10">

        <section className="space-y-6">
          <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Network Load</h4>
          <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl">
            <div className="flex items-end justify-between mb-4">
              <span className="text-4xl font-serif italic text-white leading-none">{project.currentTeamSize + 1}</span>
              <span className="text-[9px] font-black text-white/30 uppercase">/ {project.maxTeamSize} Capacity</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((project.currentTeamSize + 1) / project.maxTeamSize) * 100}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
              />
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Project Terminal</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-white hover:border-cyan-400 transition-all">
                {project.status?.replace('_', ' ')}
                <MoreHorizontal size={16} className="text-white/20" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-[#0a0a0a] border-white/10 text-white">
              <DropdownMenuLabel className="text-[10px] uppercase text-white/30 tracking-widest">Update Lifecycle</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleStatusChange('RECRUITING')} className="hover:bg-white/5 text-xs py-3">Recruiting</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('IN_PROGRESS')} className="hover:bg-white/5 text-xs py-3">In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('COMPLETED')} className="hover:bg-indigo-500/20 text-xs py-3 text-cyan-400">Completed</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={() => handleStatusChange('CANCELLED')} className="text-rose-500 hover:bg-rose-500/10 text-xs py-3">Cancelled</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </section>

        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Logical Resources</h4>
          <div className="space-y-2">
            {[
              { label: 'Source Registry', icon: Github, link: project.githubRepo },
              { label: 'Live Manifest', icon: Globe, link: project.demoUrl }
            ].filter(r => r.link).map((res, i) => (
              <a
                key={i} href={res.link} target="_blank" rel="noreferrer"
                className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-cyan-400 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <res.icon size={16} className="text-slate-500 group-hover:text-cyan-400" />
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{res.label}</span>
                </div>
                <LinkIcon size={12} className="text-white/10 group-hover:text-white" />
              </a>
            ))}
          </div>
        </section>
      </aside>

      {/* Completion Dialog */}
      <Dialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white p-8 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl">Acquisition Complete</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <p className="text-xs text-white/40 leading-relaxed uppercase tracking-widest">
              Provide manifest links to officially close the project lifecycle.
            </p>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-white/20">Source Repository</Label>
              <Input placeholder="https://github.com/..." value={completionLinks.githubRepo} onChange={e => setCompletionLinks({ ...completionLinks, githubRepo: e.target.value })} className="bg-white/5 border-white/10 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-white/20">Manifest Preview</Label>
              <Input placeholder="https://quasar.app/..." value={completionLinks.demoUrl} onChange={e => setCompletionLinks({ ...completionLinks, demoUrl: e.target.value })} className="bg-white/5 border-white/10 rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={async () => {
                await projectService.updateProject(projectId, { status: 'COMPLETED', ...completionLinks });
                window.location.reload();
              }}
              className="w-full py-4 bg-cyan-400 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white transition-all shadow-lg shadow-cyan-400/20"
            >
              Seal Lifecycle
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── TABS ──────────────────────────────────────────────────────────────── */

const OverviewTab = ({ project, isProjectLead, projectId }) => (
  <div className="space-y-10">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="col-span-2 p-10 bg-[#0b1120]/50 border-white/5 rounded-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <Cpu size={120} className="text-indigo-400" />
        </div>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Project Mission</h3>
          {project.category && (
            <Badge className="bg-indigo-500/10 text-indigo-400 border-none px-4 py-1.5 text-[9px] font-black uppercase tracking-widest">
              {project.category.name}
            </Badge>
          )}
        </div>
        <p className="font-serif italic text-2xl md:text-3xl text-white leading-relaxed mb-10">
          {project.description}
        </p>
        <div className="pt-8 border-t border-white/5 flex flex-wrap gap-10">
          <div>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Initialized</p>
            <p className="text-xs text-white/60">{new Date(project.createdAt).toDateString()}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Logical Target</p>
            <p className="text-xs text-cyan-400 italic">Quasar Peer Discovery</p>
          </div>
        </div>
      </Card>

      <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[40px]">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-8">Logical Goals</h3>
        <div className="space-y-5">
          {(project.goals || 'No goals set').split(',').map((goal, i) => (
            <div key={i} className="flex gap-4 items-start group">
              <div className="w-5 h-5 rounded-full border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5 group-hover:bg-indigo-500 group-hover:text-black transition-all">
                <CheckCircle2 size={12} />
              </div>
              <span className="text-xs text-white/60 group-hover:text-white transition-colors leading-relaxed font-light italic font-serif uppercase tracking-wider">{goal.trim()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[40px]">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-8">Logic Stack</h3>
        <div className="flex flex-wrap gap-2.5">
          {project.techStack?.map((tech, i) => (
            <span key={i} className="px-4 py-2 bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
              {tech}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[40px]">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-8">Prerequisite Intel</h3>
        <div className="flex flex-wrap gap-2.5">
          {project.requiredSkills?.map((ps, i) => (
            <span key={i} className="px-4 py-2 bg-cyan-400/5 border border-cyan-400/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
              {ps.skill?.name}
            </span>
          ))}
        </div>
      </Card>
    </div>

    <div className="p-10 bg-indigo-500/5 border border-indigo-500/10 rounded-[40px]">
      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6 flex items-center gap-3">
        <Flag size={14} /> Problem Scope
      </h4>
      <p className="font-serif italic text-2xl text-white/80 leading-relaxed max-w-4xl">
        "{project.problemStatement || "Scope undefined."}"
      </p>
    </div>
  </div>
);

const TaskBoard = ({ projectId, project }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjectTasks(projectId);
      setTasks(res?.content || res?.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [projectId]);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">Development Sprint</h2>
          <h1 className="font-serif italic text-4xl text-white">Logic Board</h1>
        </div>
        <button onClick={() => { }} className="bg-cyan-400 text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">
          + New Logic Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {['TODO', 'IN_PROGRESS', 'COMPLETED'].map(status => (
          <div key={status} className="space-y-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full w-fit">
              <div className={`w-1.5 h-1.5 rounded-full ${status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-cyan-400'}`} />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{status.replace('_', ' ')}</span>
            </div>

            <div className="space-y-4">
              {(Array.isArray(tasks) ? tasks : []).filter(t => t.status === status).map(task => (
                <Card key={task.id} className="p-6 bg-[#0b1120]/50 border-white/5 rounded-3xl hover:border-indigo-500/40 transition-all group">
                  <div className="flex justify-between mb-4">
                    <span className="text-[8px] font-black uppercase text-indigo-400 tracking-tighter bg-indigo-500/10 px-2 py-0.5 rounded">
                      {task.priority} Priority
                    </span>
                    <MoreHorizontal size={14} className="text-white/10 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2 leading-snug">{task.title}</h4>
                  <p className="text-[11px] text-white/40 line-clamp-2 italic font-serif leading-relaxed">{task.description}</p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatSection = ({ projectId }) => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      const res = await chatService.getRecentMessages(projectId);
      setMessages(res.data?.content || res.data || []);
    };
    fetch();
    const int = setInterval(fetch, 5000);
    return () => clearInterval(int);
  }, [projectId]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  return (
    <div className="h-[calc(100vh-250px)] flex flex-col bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden">
      <div ref={scrollRef} className="flex-1 p-8 space-y-6 overflow-y-auto no-scrollbar">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.sender?.id === 'me' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">{m.sender?.firstName}</span>
              <span className="text-[8px] text-white/10">{new Date(m.sentAt).toLocaleTimeString()}</span>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-light tracking-wide max-w-lg leading-relaxed italic font-serif">
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 bg-black/40 border-t border-white/5">
        <div className="flex gap-4 items-center bg-white/5 p-2 px-6 rounded-2xl border border-white/10">
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Transmit message..."
            className="flex-1 bg-transparent border-none py-3 text-xs outline-none font-light uppercase tracking-widest italic"
          />
          <button onClick={async () => {
            await chatService.sendMessage(projectId, msg);
            setMsg("");
          }} className="p-2 text-cyan-400 hover:text-white transition-colors">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TeamSection = ({ projectId, project }) => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    projectService.getProjectMembers(projectId).then(res => setMembers(res.data?.content || res.data || []));
  }, [projectId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map(m => (
        <Card key={m.id} className="p-6 bg-white/[0.02] border-white/5 rounded-3xl flex items-center justify-between group hover:border-cyan-400 transition-all">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border border-white/10">
              <AvatarImage src={m.user?.profilePictureUrl} />
              <AvatarFallback className="bg-slate-800 text-indigo-400 font-black">{m.user?.firstName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-tighter leading-none">{m.user?.firstName} {m.user?.lastName}</p>
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-2">{m.role || 'Contributor'}</p>
            </div>
          </div>
          <MoreVertical size={16} className="text-white/10 group-hover:text-white" />
        </Card>
      ))}
    </div>
  );
};

const SettingsTab = ({ project, projectId, isProjectLead }) => (
  <div className="max-w-3xl mx-auto space-y-10">
    <Card className="p-10 bg-[#0b1120]/50 border-white/5 rounded-[40px]">
      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8">Logic Modification</h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[9px] font-black uppercase text-white/20">Registry Title</Label>
          <Input defaultValue={project.title} className="bg-white/5 border-white/10 h-14 rounded-2xl font-serif italic text-xl" />
        </div>
        <div className="space-y-2">
          <Label className="text-[9px] font-black uppercase text-white/20">Manifest Description</Label>
          <Textarea defaultValue={project.description} className="bg-white/5 border-white/10 rounded-2xl min-h-[150px] font-serif italic text-lg leading-relaxed" />
        </div>
        <div className="flex justify-end pt-4">
          <button className="bg-white text-black px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all">
            Update Logic Core
          </button>
        </div>
      </div>
    </Card>

    {isProjectLead && (
      <div className="p-10 border border-rose-500/20 bg-rose-500/[0.02] rounded-[40px] flex justify-between items-center">
        <div>
          <h4 className="text-rose-500 font-black text-[10px] uppercase tracking-widest">Danger Sequence</h4>
          <p className="text-xs text-rose-500/40 italic font-serif mt-1 tracking-wider">Purge project from registry permanently.</p>
        </div>
        <button className="px-8 py-4 border border-rose-500/40 text-rose-500 rounded-xl text-[10px] font-black uppercase hover:bg-rose-500 hover:text-black transition-all">
          Purge Project
        </button>
      </div>
    )}
  </div>
);