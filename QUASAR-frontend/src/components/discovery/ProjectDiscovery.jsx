import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

// UI Components
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import {
  Search, Users, Calendar, Loader2,
  Send, Briefcase, Filter, X, Sparkles, MapPin, Rocket,
  ChevronRight, Bookmark, Globe, Layers, LayoutGrid, Clock
} from 'lucide-react';

// Services
import projectService from '../../services/projectService';
import { joinRequestService } from '../../services/JoinRequestService';
import ProjectChatBot from './ProjectChatBot';
import ProjectDetailModal from './ProjectDetailModal';

export default function ProjectDiscovery() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [categories, setCategories] = useState([]);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByCollege, setFilterByCollege] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [status, setStatus] = useState('ALL');
  const [skillFilter, setSkillFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      let projectsData = [];
      const hasFilters = searchTerm || skillFilter || selectedCategory !== 'All' || filterByCollege || availableOnly || status !== 'ALL';

      if (!hasFilters) {
        const res = await projectService.discoverProjects(page, 10);
        projectsData = res.content || res.data || [];
        setTotalPages(res.totalPages || 0);
      } else if (filterByCollege && currentUser.collegeId) {
        const res = await projectService.getProjectsByCollege(currentUser.collegeId);
        let allCollegeProjects = res.data?.content || res.content || res.data || res || [];
        if (!Array.isArray(allCollegeProjects)) allCollegeProjects = [];
        const norm = str => (str || '').toLowerCase();
        projectsData = allCollegeProjects.filter(p => {
          const matchesSearch = !searchTerm || norm(p.title).includes(norm(searchTerm)) || norm(p.description).includes(norm(searchTerm));
          const matchesCategory = selectedCategory === 'All' || p.categoryName === selectedCategory;
          const matchesStatus = !status || status === 'ALL' || p.status === status;
          const matchesAvailable = !availableOnly || (p.status === 'RECRUITING');
          const projectSkills = (p.requiredSkills || []).map(s => norm(s.skill?.name || s.skillName || ''));
          const searchSkills = skillFilter.split(',').map(s => norm(s.trim())).filter(Boolean);
          const matchesSkills = searchSkills.length === 0 || searchSkills.some(s => projectSkills.some(ps => ps.includes(s)));
          return matchesSearch && matchesCategory && matchesStatus && matchesAvailable && matchesSkills;
        });
      } else {
        const params = {
          query: searchTerm || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          status: status === 'ALL' ? undefined : status,
          skills: skillFilter ? skillFilter.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          availableOnly: availableOnly,
          page: page,
          size: 10
        };
        const res = await projectService.searchProjects(params);
        projectsData = res.content || res.data || (Array.isArray(res) ? res : []);
        setTotalPages(res.totalPages || 0);
      }

      setProjects(projectsData.map(p => ({
        ...p,
        requiredSkills: (p.requiredSkills || []).map(s => typeof s === 'string' ? s : (s.skill?.name || s.skillName)).filter(Boolean)
      })));
    } catch (err) {
      console.error("Discovery error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, searchTerm, skillFilter, selectedCategory, status, availableOnly, filterByCollege, page]);

  useEffect(() => {
    const init = async () => {
      try {
        const [cats, reqs] = await Promise.all([
          projectService.getProjectCategories(),
          joinRequestService.getMyJoinRequests()
        ]);
        setCategories(cats || []);
        setSentRequests(new Set((reqs || []).map(r => r.project?.id).filter(Boolean)));
        fetchProjects();
      } catch (e) { console.error("Init Error", e); }
    };
    init();
  }, []);

  const handleJoinSuccess = (projectId) => {
    setSentRequests(p => new Set(p).add(projectId));
  };



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* Search Header */}
      <header className="sticky top-0 z-50 w-full h-20 bg-white/90 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/60 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/data/Logo.png" alt="Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Project Hub</h1>
        </div>

        <div className="flex-1 max-w-xl mx-12 relative hidden md:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-blue-600 transition-colors" />
          <Input
            placeholder="Search by title, keywords, or technology..."
            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl h-12 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none dark:text-white"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          />
        </div>

        <div className="flex items-center gap-4">
          <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-none font-black px-4 py-1.5 text-xs">
            {projects.length} MATCHES FOUND
          </Badge>
          <ModeToggle />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Filters */}
        <aside className="w-72 border-r border-slate-200 dark:border-slate-800/60 p-8 hidden lg:flex flex-col gap-10 bg-white dark:bg-[#0B1120] sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">
          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Discovery Filters</h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between group">
                <Label htmlFor="college-side" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">My Campus Only</Label>
                <Switch id="college-side" checked={filterByCollege} onCheckedChange={(v) => { setFilterByCollege(v); setPage(0); }} className="data-[state=checked]:bg-blue-600" />
              </div>
              <div className="flex items-center justify-between group">
                <Label htmlFor="avail-side" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Actively Recruiting</Label>
                <Switch id="avail-side" checked={availableOnly} onCheckedChange={(v) => { setAvailableOnly(v); setPage(0); }} className="data-[state=checked]:bg-blue-600" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timeline Status</Label>
                <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
                  <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-medium dark:text-slate-300">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="RECRUITING">Recruiting</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Required Skills</Label>
                <Input
                  placeholder="e.g. React, Python"
                  className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-white"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                />
              </div>
              <Button onClick={() => { setPage(0); fetchProjects(); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl transition-all shadow-md shadow-blue-100">
                Update Results
              </Button>
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Domain Categories</h4>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => { setSelectedCategory('All'); setPage(0); }}
                className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedCategory === 'All' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                All Domains
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.name); setPage(0); }}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat.name ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </section>
        </aside>

        {/* Content Feed */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          {/* Mobile Domain Badges */}
          <div className="lg:hidden mb-8 overflow-x-auto pb-4 flex gap-2 no-scrollbar">
            <Badge
              onClick={() => { setSelectedCategory('All'); setPage(0); }}
              className={`cursor-pointer px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border ${selectedCategory === 'All' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              All Domains
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.name); setPage(0); }}
                className={`cursor-pointer px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border ${selectedCategory === cat.name ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                {cat.name}
              </Badge>
            ))}
          </div>

          {loading && projects.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-full border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 rounded-[28px] overflow-hidden shadow-sm">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <Skeleton className="h-6 w-24 rounded-full bg-slate-100 dark:bg-slate-800" />
                      <Skeleton className="h-2.5 w-2.5 rounded-full bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <Skeleton className="h-8 w-3/4 mb-4 rounded-lg bg-slate-100 dark:bg-slate-800" />
                    <Skeleton className="h-4 w-full mb-2 rounded-md bg-slate-100 dark:bg-slate-800" />
                    <Skeleton className="h-4 w-2/3 mb-6 rounded-md bg-slate-100" />
                    <div className="flex gap-2 mb-8">
                      <Skeleton className="h-6 w-16 rounded-lg bg-slate-100" />
                      <Skeleton className="h-6 w-16 rounded-lg bg-slate-100" />
                      <Skeleton className="h-6 w-16 rounded-lg bg-slate-100" />
                    </div>
                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full bg-slate-100" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-24 mb-1 rounded bg-slate-100" />
                        <Skeleton className="h-2 w-16 rounded bg-slate-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-full mb-6 text-slate-400">
                <Briefcase size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No projects found</h3>
              <p className="text-slate-500 max-w-sm">We couldn't find any projects matching those specific filters. Try broadening your criteria.</p>
              <Button variant="link" onClick={() => { setSearchTerm(''); setSkillFilter(''); setStatus('ALL'); setPage(0); fetchProjects(); }} className="mt-4 text-blue-600 font-bold">Clear all filters</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-8 h-full">
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
                      <Card className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1.5 transition-all duration-300 rounded-[28px] overflow-hidden flex flex-col h-full group cursor-pointer" onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}>
                        <CardContent className="p-8 flex flex-col h-full">
                          <div className="flex items-center justify-between mb-6">
                            <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-none font-black text-[9px] uppercase tracking-[0.15em] px-3">
                              {project.categoryName || "General"}
                            </Badge>
                            <div className={`w-2.5 h-2.5 rounded-full ${project.status === 'RECRUITING' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                          </div>

                          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                            {project.title}
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-6 font-medium">
                            {project.description || project.goals || 'Innovative campus project ready for collaboration.'}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mb-8">
                            {project.requiredSkills?.slice(0, 3).map((s, si) => (
                              <span key={si} className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 px-2.5 py-1 rounded-lg uppercase">
                                {s}
                              </span>
                            ))}
                            {project.requiredSkills?.length > 3 && (
                              <span className="text-[10px] font-black text-slate-400 px-2 py-1">+{project.requiredSkills.length - 3} MORE</span>
                            )}
                          </div>

                          <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                            </div>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 ring-2 ring-white dark:ring-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                                <AvatarImage src={project.lead?.profilePictureUrl} />
                                <AvatarFallback className="text-[10px] bg-slate-900 dark:bg-slate-700 text-white font-bold">
                                  {project.lead?.firstName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">{project.lead?.firstName}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Project Lead</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-auto pt-8">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    className="text-slate-500 hover:text-blue-600 font-bold"
                  >
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none scale-110'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === totalPages - 1}
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    className="text-slate-500 hover:text-blue-600 font-bold"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Reused Modal */}
      <ProjectDetailModal
        project={selectedProject}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onJoinSuccess={handleJoinSuccess}
      />
    </div >
  );
}