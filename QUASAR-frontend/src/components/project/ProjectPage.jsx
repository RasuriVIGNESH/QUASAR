import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import {
  LayoutDashboard, ClipboardList, Users, MessageSquare, Settings,
  Github, Globe, ArrowLeft, Plus, Send, Sparkles,
  CheckCircle2, Rocket, Zap, MoreVertical, Link as LinkIcon, Trash2, Video,
  Search, Flag, Layers, MoreHorizontal, Calendar, Tag, AlertCircle, Edit, LogOut
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

// Services
import { projectService } from '../../services/projectService.js';
import { chatService } from '../../services/Chatservice.js';
import MeetingRooms from './MeetingRooms';

export default function ProjectPage() {
  const { projectId } = useParams();
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [members, setMembers] = useState([]);

  // Status Management State
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [completionLinks, setCompletionLinks] = useState({ githubRepo: '', demoUrl: '' });
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [projectData, membersData] = await Promise.all([
          projectService.getProject(projectId),
          projectService.getProjectMembers(projectId)
        ]);
        setProject(projectData);
        setMembers(membersData.data?.content || membersData.data || []);

        // Initialize completion links if they exist
        if (projectData) {
          setCompletionLinks({
            githubRepo: projectData.githubRepo || '',
            demoUrl: projectData.demoUrl || ''
          });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [projectId]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'COMPLETED') {
      // Check if links exist
      if (!project.githubRepo && !project.demoUrl) {
        setPendingStatus(newStatus);
        setIsCompletionDialogOpen(true);
        return;
      }
    }

    // If not completed or links exist, update directly
    try {
      await projectService.updateProject(projectId, { status: newStatus });
      setProject(prev => ({ ...prev, status: newStatus }));
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const handleCompletionSubmit = async () => {
    if (!completionLinks.githubRepo && !completionLinks.demoUrl) {
      alert("Please provide at least one link (GitHub Repo or Demo URL) to complete the project.");
      return;
    }

    try {
      await projectService.updateProject(projectId, {
        status: 'COMPLETED',
        githubRepo: completionLinks.githubRepo,
        demoUrl: completionLinks.demoUrl
      });
      setIsCompletionDialogOpen(false);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to complete project");
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full"
      />
    </div>
  );

  const currentUserId = userProfile?.id || currentUser?.id || currentUser?.userId || currentUser?._id;

  const isProjectLead = (() => {
    if (!project || !currentUserId) return false;

    const leadTarget = project.lead;
    // Check by ID (handle object with id/_id/userId property and direct ID value)
    const leadId = leadTarget?.id || leadTarget?._id || leadTarget?.userId || leadTarget;

    // Ensure we are comparing primitives (or stringifiable IDs), not full objects
    if (leadId && typeof leadId !== 'object' && String(currentUserId) === String(leadId)) return true;

    // Check by Email fallback
    const userEmail = userProfile?.email || currentUser?.email;
    const leadEmail = leadTarget?.email;
    if (userEmail && leadEmail && userEmail === leadEmail) return true;

    return false;
  })();

  const isMember = members.some(m => String(m.user.id) === String(currentUserId)) || isProjectLead;

  return (
    <div className="h-screen w-full bg-[#F8FAFC] text-slate-900 flex overflow-hidden font-sans">

      {/* --- SLIM SIDEBAR NAVIGATION --- */}
      <aside className="w-20 border-r border-slate-200 flex flex-col items-center py-6 gap-8 bg-white z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <img src="/data/logo.png" alt="Dashboard" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-indigo-200 cursor-pointer" onClick={() => navigate('/dashboard')} />

        <nav className="flex flex-col gap-4">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'rooms', icon: Video, label: 'Rooms' },
            { id: 'tasks', icon: ClipboardList, label: 'Board' },
            { id: 'chat', icon: MessageSquare, label: 'Chat' },
            { id: 'team', icon: Users, label: 'Team' },
            ...(isMember ? [{ id: 'manage', icon: Settings, label: 'Settings' }] : [])
          ].map((item) => (
            <TooltipProvider key={item.id}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`p-3 rounded-xl transition-all duration-200 relative ${activeTab === item.id
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {activeTab === item.id && (
                      <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-600 rounded-r-full" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-900 text-white text-xs font-semibold">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>

        <button onClick={() => navigate(-1)} className="mt-auto p-3 text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden">

        {/* TOP BAR */}
        <header className="h-16 border-b border-slate-200 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-900">{project.title}</h1>

            {/* Status Display in Header (Read Only) */}
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
              {project.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2 mr-2">
              {[1, 2, 3].map((i) => (
                <Avatar key={i} className="w-7 h-7 border-2 border-white ring-1 ring-slate-100 shadow-sm">
                  <AvatarFallback className="text-[10px] bg-indigo-50 text-indigo-600 font-bold">
                    {project.lead?.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Button
              onClick={() => navigate(`/projects/${projectId}/invite`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 h-9 text-xs font-bold shadow-sm"
            >
              Invite
            </Button>
          </div>
        </header>

        {/* CONTENT VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="h-full max-w-6xl mx-auto"
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

      {/* --- RIGHT SIDEBAR: PROJECT INTEL --- */}
      <aside className="w-80 border-l border-slate-200 bg-white p-8 hidden xl:flex flex-col gap-10">

        <div className="space-y-6">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Project Stats</h4>
          <Card className="p-5 border-slate-100 shadow-sm bg-gradient-to-br from-indigo-50/50 to-white">
            <div className="flex items-end justify-between mb-4">
              <span className="text-3xl font-bold text-slate-900">{project.currentTeamSize + 1}</span>
              <span className="text-xs font-bold text-slate-400">/ {project.maxTeamSize} Capacity</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((project.currentTeamSize + 1) / project.maxTeamSize) * 100}%` }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Project Status</h4>
          {currentUserId ? (
            <div className="w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-slate-50 border-slate-200 text-slate-700 font-semibold h-10">
                    {project.status ? project.status.replace('_', ' ') : 'Status'}
                    <MoreHorizontal size={16} className="text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white z-[60] shadow-lg border-slate-200">
                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusChange('RECRUITING')}>
                    Recruiting
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('IN_PROGRESS')}>
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('COMPLETED')}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('CANCELLED')} className="text-red-600">
                    Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Completion Dialog (Moved to Sidebar scope) */}
              <Dialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Project Completion</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <p className="text-sm text-slate-600">
                      To mark this project as completed, please provide links to the final output. At least one link is required.
                    </p>
                    <div className="space-y-2">
                      <Label>GitHub Repository</Label>
                      <Input
                        placeholder="https://github.com/..."
                        value={completionLinks.githubRepo}
                        onChange={e => setCompletionLinks({ ...completionLinks, githubRepo: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Live Demo URL</Label>
                      <Input
                        placeholder="https://..."
                        value={completionLinks.demoUrl}
                        onChange={e => setCompletionLinks({ ...completionLinks, demoUrl: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCompletionSubmit} className="bg-indigo-600 text-white">
                      Complete Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
              <span className="text-sm font-bold text-slate-700">{project.status ? project.status.replace('_', ' ') : 'Status'}</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Resources</h4>
          <div className="grid gap-2">
            {[
              { label: 'GitHub Repo', icon: Github, link: project.githubRepo },
              { label: 'Live Preview', icon: Globe, link: project.demoUrl }
            ]
              .filter(res => res.link)
              .map((res, i) => (
                <a
                  key={i} href={res.link} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <res.icon size={16} className="text-slate-500 group-hover:text-indigo-600" />
                    <span className="text-xs font-semibold text-slate-700">{res.label}</span>
                  </div>
                  <LinkIcon size={12} className="text-slate-300" />
                </a>
              ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

const OverviewTab = ({ project, isProjectLead, projectId }) => {
  const [isTechDialogOpen, setIsTechDialogOpen] = useState(false);
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [newTech, setNewTech] = useState("");
  const [newSkill, setNewSkill] = useState({ name: "", category: "General", isRequired: true });

  const handleAddTech = async () => {
    if (!newTech.trim()) return;
    try {
      const currentStack = project.techStack || [];
      const updatedStack = [...currentStack, newTech.trim()];
      await projectService.updateProject(projectId, { techStack: updatedStack });
      window.location.reload();
    } catch (e) { console.error(e); }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) return;
    try {
      // Backend expects list of ProjectSkill objects: { skill: { name, category }, isRequired }
      // This might depend on how backend handles updates. 
      // If backend replaces the list, we need to send existing + new.
      // Assuming 'requiredSkills' is the field to update.
      const currentSkills = project.requiredSkills || [];

      // Construct the new skill object structure matching backend expectation
      // Note: Backend might need existing skill IDs if they exist, or just the structure.
      // Based on previous JSON, `requiredSkills` is a list of objects.

      const newSkillObj = {
        skill: { name: newSkill.name, category: newSkill.category },
        isRequired: newSkill.isRequired
      };

      const updatedSkills = [...currentSkills, newSkillObj];

      await projectService.updateProject(projectId, { requiredSkills: updatedSkills });
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to update skills. Backend might require different format.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 p-10 border-slate-200/60 shadow-sm bg-white rounded-[24px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Layers className="text-indigo-600" size={20} />
              <h3 className="text-lg font-bold text-slate-900">Project Mission</h3>
            </div>
            {project.category && (
              <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50">
                {project.category.name}
              </Badge>
            )}
          </div>
          <p className="text-slate-600 text-base leading-relaxed">
            {project.description}
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <span>Started {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            {project.updatedAt && (
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-slate-400" />
                <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-8 border-slate-200/60 shadow-sm bg-white rounded-[24px]">
            <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-widest">Key Goals</h3>
            {project.goals ? (
              <div className="space-y-5">
                {project.goals.split(',').map((goal, i) => (
                  <div key={i} className="flex gap-3 items-start group">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <CheckCircle2 size={12} />
                    </div>
                    <span className="text-sm font-medium text-slate-600 leading-tight">{goal.trim()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No goals defined yet.</p>
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tech Stack Card */}
        <Card className="p-10 border-slate-200/60 shadow-sm bg-white rounded-[24px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Layers className="text-indigo-600" size={20} />
              <h3 className="text-lg font-bold text-slate-900">Tech Stack</h3>
            </div>
            {isProjectLead && (
              <Dialog open={isTechDialogOpen} onOpenChange={setIsTechDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg border-slate-200 text-slate-600 gap-2">
                    <Plus size={14} /> Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Add Tech Stack</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Label>Technology Name</Label>
                    <Input
                      placeholder="e.g. React, Python..."
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddTech} className="bg-indigo-600 text-white">Add Technology</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {project.techStack?.map((tech, i) => (
              <div key={`tech-${i}`} className="flex items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl gap-2 hover:bg-slate-100 transition-colors">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-sm font-semibold text-slate-700">{tech}</span>
              </div>
            ))}
            {!project.techStack?.length && (
              <p className="text-slate-400 italic">No tech stack defined.</p>
            )}
          </div>
        </Card>

        {/* Required Skills Card */}
        <Card className="p-10 border-slate-200/60 shadow-sm bg-white rounded-[24px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="text-indigo-600" size={20} />
              <h3 className="text-lg font-bold text-slate-900">Required Skills</h3>
            </div>
            {isProjectLead && (
              <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg border-slate-200 text-slate-600 gap-2">
                    <Plus size={14} /> Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Add Required Skill</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div>
                      <Label>Skill Name</Label>
                      <Input
                        placeholder="e.g. Machine Learning"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select onValueChange={(v) => setNewSkill({ ...newSkill, category: v })} defaultValue="General">
                        <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="Frontend">Frontend</SelectItem>
                          <SelectItem value="Backend">Backend</SelectItem>
                          <SelectItem value="DevOps">DevOps</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddSkill} className="bg-indigo-600 text-white">Add Skill</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {project.requiredSkills?.map((ps, i) => (
              <div key={`skill-${i}`} className="flex items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl gap-2 hover:bg-slate-100 transition-colors">
                <div className={`w-2 h-2 rounded-full ${ps.isRequired ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                <span className="text-sm font-semibold text-slate-700">{ps.skill?.name || "Unknown Skill"}</span>
                {ps.skill?.category && (
                  <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2 ml-1 uppercase font-bold tracking-wider">
                    {ps.skill.category}
                  </span>
                )}
              </div>
            ))}

            {/* Legacy Support for projectSkills if exists */}
            {project.projectSkills?.map((ps, i) => (
              <div key={`legacy-skill-${i}`} className="flex items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl gap-2 hover:bg-slate-100 transition-colors">
                <div className={`w-2 h-2 rounded-full ${ps.required ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                <span className="text-sm font-semibold text-slate-700">{ps.skill?.name || "Unknown Skill"}</span>
                {ps.skill?.category && (
                  <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2 ml-1 uppercase font-bold tracking-wider">
                    {ps.skill.category}
                  </span>
                )}
              </div>
            ))}

            {(!project.requiredSkills?.length && !project.projectSkills?.length) && (
              <p className="text-slate-400 italic">No specific skills listed.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-10 border-slate-200/60 shadow-sm bg-indigo-600 rounded-[24px] text-white">
        <div className="flex items-center gap-3 mb-4 opacity-80">
          <Flag size={18} />
          <h3 className="text-xs font-bold uppercase tracking-widest">The Problem Statement</h3>
        </div>
        <p className="text-xl font-medium leading-relaxed italic opacity-100">
          "{project.problemStatement || "No problem statement defined."}"
        </p>
      </Card>
    </div>
  );
};

const TaskBoard = ({ projectId, project }) => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', assignedToId: '' });

  const fetchData = async () => {
    try {
      const [tasksRes, membersRes] = await Promise.all([
        projectService.getProjectTasks(projectId),
        projectService.getProjectMembers(projectId)
      ]);
      setTasks(tasksRes || []);
      setMembers(membersRes.data?.content || membersRes.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [projectId]);

  const handleSaveTask = async () => {
    if (!newTask.title) return;
    try {
      if (editingTaskId) {
        await projectService.updateTask(projectId, editingTaskId, newTask);
      } else {
        await projectService.createTask(projectId, newTask);
      }
      setIsDialogOpen(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', assignedToId: '' });
      setEditingTaskId(null);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await projectService.deleteTask(projectId, taskId);
        fetchData();
      } catch (e) { console.error(e); }
    }
  };

  const openEditDialog = (task) => {
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      assignedToId: task.assignedTo?.id || ''
    });
    setEditingTaskId(task.id);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Task Pipeline</h2>
          <p className="text-sm text-slate-500">Manage your sprint progress and team tasks.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-6 font-bold shadow-md shadow-indigo-100">
              <Plus className="w-4 h-4 mr-2" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white rounded-2xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{editingTaskId ? 'Edit Task' : 'New Task'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500 uppercase font-bold">Task Title</Label>
                <Input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="border-slate-200 rounded-lg focus:ring-indigo-500" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500 uppercase font-bold">Description</Label>
                <Textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} className="border-slate-200 rounded-lg focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select onValueChange={v => setNewTask({ ...newTask, priority: v })}>
                  <SelectTrigger className="border-slate-200">Priority</SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={v => setNewTask({ ...newTask, assignedToId: v })}>
                  <SelectTrigger className="border-slate-200">Assigned To</SelectTrigger>
                  <SelectContent className="bg-white">
                    {members.map(m => <SelectItem key={m.user.id} value={m.user.id}>{m.user.firstName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>

              <Button onClick={handleSaveTask} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl">
                {editingTaskId ? 'Save Changes' : 'Create Task'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1">
        {['TODO', 'IN_PROGRESS', 'COMPLETED'].map(status => (
          <div key={status} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
              <div className={`w-1.5 h-1.5 rounded-full ${status === 'COMPLETED' ? 'bg-emerald-500' : status === 'IN_PROGRESS' ? 'bg-indigo-500' : 'bg-slate-300'}`} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{status.replace('_', ' ')}</span>
            </div>

            <div className="space-y-4">
              {tasks.filter(t => t.status === status).map(task => (
                <Card key={task.id} className="p-5 border-slate-200/60 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group bg-white rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <Badge className={`px-2 py-0 text-[9px] font-bold border-none ${task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600' :
                      task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                      }`}>
                      {task.priority}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-slate-300 hover:text-slate-600 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                          <MoreHorizontal size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(task)}>
                          <Edit className="w-3.5 h-3.5 mr-2" /> Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:bg-red-50" onClick={() => handleDeleteTask(task.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2 leading-snug">{task.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>

                  {task.assignedToName && (
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700">
                        {task.assignedToName[0]}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{task.assignedToName}</span>
                    </div>
                  )}
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
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const scrollRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Initial fetch - get recent messages
  const fetchInitialMessages = async () => {
    try {
      const res = await chatService.getRecentMessages(projectId);
      // Ensure we handle different response structures
      const msgs = res.data?.content || res.data || res || [];
      // Sort by time just in case
      const sorted = Array.isArray(msgs) ? msgs.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt)) : [];
      setMessages(sorted);

      if (sorted.length > 0) {
        lastTimeRef.current = sorted[sorted.length - 1].sentAt;
      }
    } catch (e) { console.error(e); }
  };

  // Poll for new messages only
  const pollNewMessages = async () => {
    if (!lastTimeRef.current) return;
    try {
      // getMessagesAfter expects an ISO string. sentAt is usually ISO.
      const res = await chatService.getMessagesAfter(projectId, lastTimeRef.current);
      const newMsgs = res.data?.content || res.data || res || [];

      if (Array.isArray(newMsgs) && newMsgs.length > 0) {
        // Filter out any duplicates just in case
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.id));
          const uniqueNew = newMsgs.filter(m => !ids.has(m.id))
            .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

          if (uniqueNew.length === 0) return prev;

          lastTimeRef.current = uniqueNew[uniqueNew.length - 1].sentAt;
          return [...prev, ...uniqueNew];
        });
      }
    } catch (e) { console.error("Polling error", e); }
  };

  useEffect(() => {
    fetchInitialMessages();
    const interval = setInterval(pollNewMessages, 3000);
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!msg.trim()) return;
    try {
      if (editingMessageId) {
        await chatService.editMessage(editingMessageId, msg);
        // For edits, we might need to update local state manually or re-fetch
        setMessages(prev => prev.map(m => m.id === editingMessageId ? { ...m, content: msg } : m));
        setEditingMessageId(null);
      } else {
        const res = await chatService.sendMessage(projectId, msg);
        // Optimistically append or let polling catch it? 
        // Polling (3s) might feel laggy. Let's append if response contains the message.
        // Usually response.data is the message.
        if (res.data) {
          const sentMsg = res.data;
          setMessages(prev => [...prev, sentMsg]);
          lastTimeRef.current = sentMsg.sentAt;
        } else {
          // Fallback if response structure is different
          pollNewMessages();
        }
      }
      setMsg("");
    } catch (e) { console.error(e); }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Delete this message?")) {
      try {
        await chatService.deleteMessage(messageId);
        setMessages(prev => prev.filter(m => m.id !== messageId));
      } catch (e) { console.error(e); }
    }
  };

  const startEdit = (m) => {
    setMsg(m.content);
    setEditingMessageId(m.id);
  };

  const cancelEdit = () => {
    setMsg("");
    setEditingMessageId(null);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-slate-50/20">
        {messages.map((m) => {
          const isMe = m.sender.id === userProfile?.id;
          return (
            <div key={m.id} className={`flex items-start gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}>
              <Avatar className="w-8 h-8 rounded-lg shadow-sm">
                <AvatarFallback className="bg-white text-indigo-600 text-[10px] font-bold">{m.sender.firstName?.[0]}</AvatarFallback>
              </Avatar>
              <div className={`max-w-[65%]`}>
                {!isMe && <p className="text-[10px] font-bold text-slate-400 mb-1 ml-1">{m.sender.firstName}</p>}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                  {m.content}
                </div>
                {isMe && (
                  <div className="flex justify-end mt-1 gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                    <button onClick={() => startEdit(m)} className="text-[9px] font-bold text-slate-400 hover:text-indigo-600">Edit</button>
                    <button onClick={() => handleDeleteMessage(m.id)} className="text-[9px] font-bold text-slate-400 hover:text-red-600">Delete</button>
                  </div>
                )}

                <p className={`text-[9px] text-slate-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="flex items-center gap-3 bg-slate-50 p-1.5 pl-5 rounded-2xl border border-slate-200">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none h-11 text-sm outline-none text-slate-900"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
              if (e.key === 'Escape' && editingMessageId) cancelEdit();
            }}
          />
          {editingMessageId && (
            <Button onClick={cancelEdit} variant="ghost" className="h-11 w-11 rounded-xl p-0 text-slate-400 hover:text-slate-600">
              <span className="text-xs font-bold">X</span>
            </Button>
          )}
          <Button
            onClick={handleSend}
            disabled={!msg.trim()}
            className="h-11 w-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 p-0 transition-all"
          >
            <Send size={18} className="text-white" />
          </Button>
        </div>
      </div>
    </div >
  );
};

const TeamSection = ({ projectId, project }) => {
  const { userProfile } = useAuth();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await projectService.getProjectMembers(projectId);
      setMembers(res.data?.content || res.data || []);
    };
    fetch();
  }, [projectId]);

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        await projectService.removeMember(projectId, memberId);
        window.location.reload(); // Simple reload to refresh list
      } catch (e) {
        console.error(e);
        alert("Failed to remove member");
      }
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await projectService.updateMemberRole(projectId, memberId, newRole);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to update role");
    }
  };

  const handleLeaveProject = async () => {
    if (window.confirm("Are you sure you want to leave this project?")) {
      try {
        await projectService.leaveProject(projectId);
        window.location.href = '/dashboard';
      } catch (e) {
        console.error(e);
        alert("Failed to leave project");
      }
    }
  };

  const displayedMembers = React.useMemo(() => {
    const leadId = project?.lead?.id;
    const otherMembers = members.filter(m => String(m.user.id) !== String(leadId));

    if (project?.lead) {
      return [
        {
          id: 'lead',
          user: project.lead,
          role: 'Team Lead'
        },
        ...otherMembers
      ];
    }
    return otherMembers;
  }, [members, project]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayedMembers.map(member => (
        <Card key={member.id} className="p-5 bg-white border-slate-200 shadow-sm rounded-2xl flex items-center justify-between hover:border-indigo-300 transition-all group">
          <div className="flex items-center gap-4 overflow-hidden">
            <Avatar className="h-10 w-10 rounded-xl shadow-sm border border-slate-100 shrink-0">
              <AvatarImage src={member.user.profilePictureUrl} />
              <AvatarFallback className="bg-slate-50 text-indigo-600 font-bold">{member.user.firstName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <h4 className="font-bold text-slate-900 text-sm truncate leading-snug">
                {member.user.firstName} {member.user.lastName}
              </h4>
              <Badge className="w-fit bg-slate-50 text-slate-500 text-[9px] uppercase tracking-widest mt-1.5 border-none">
                {member.role || 'Member'}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-slate-300 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-all shrink-0 opacity-0 group-hover:opacity-100">
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* If I am Lead, and target is not Lead, I can manage them */}
              {project?.lead?.id === userProfile?.id && member.id !== 'lead' && (
                <>
                  <DropdownMenuItem onClick={() => handleUpdateRole(member.user.id || member.userId, 'LEAD')}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Make Lead
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:bg-red-50" onClick={() => handleRemoveMember(member.id || member.userId)}>
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Remove Member
                  </DropdownMenuItem>
                </>
              )}
              {/* If default/member view, allow leaving */}
              {(String(member.user.id) === String(userProfile?.id) && member.role !== 'Team Lead') && (
                <DropdownMenuItem className="text-red-600 focus:bg-red-50" onClick={handleLeaveProject}>
                  <LogOut className="w-3.5 h-3.5 mr-2" /> Leave Project
                </DropdownMenuItem>
              )}
              {/* If nothing to show */}
              {!(project?.lead?.id === userProfile?.id && member.id !== 'lead') && !(String(member.user.id) === String(userProfile?.id)) && (
                <DropdownMenuItem disabled>No actions</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      ))}
    </div>
  );
};

const SettingsTab = ({ project, projectId, isProjectLead }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ...project,
    githubRepo: project.githubRepo || '',
    demoUrl: project.demoUrl || ''
  });

  const handleUpdate = async () => {
    await projectService.updateProject(projectId, formData);
    window.location.reload();
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this project?")) {
      await projectService.deleteProject(projectId);
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="bg-white border-slate-200 shadow-sm p-10 rounded-[32px]">
        <h3 className="text-xl font-bold text-slate-900 mb-8">General Settings</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase">Project Title</Label>
            <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="border-slate-200 h-12 rounded-xl focus:ring-indigo-500" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase">Description</Label>
            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="border-slate-200 rounded-xl min-h-[120px] focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">GitHub Repository</Label>
              <div className="relative">
                <Github className="absolute left-3 top-3 text-slate-400" size={16} />
                <Input
                  value={formData.githubRepo}
                  onChange={e => setFormData({ ...formData, githubRepo: e.target.value })}
                  className="pl-10 border-slate-200 h-11 rounded-xl focus:ring-indigo-500"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Live Preview URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 text-slate-400" size={16} />
                <Input
                  value={formData.demoUrl}
                  onChange={e => setFormData({ ...formData, demoUrl: e.target.value })}
                  className="pl-10 border-slate-200 h-11 rounded-xl focus:ring-indigo-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleUpdate} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-indigo-100">
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {isProjectLead && (
        <Card className="bg-rose-50/50 border-rose-100 p-10 rounded-[32px] flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-rose-900">Danger Zone</h4>
            <p className="text-sm text-rose-700/70">Permanently delete this project and all data.</p>
          </div>
          <Button onClick={handleDelete} variant="destructive" className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-8 h-12 font-bold">
            Delete Project
          </Button>
        </Card>
      )}
    </div>
  );
};