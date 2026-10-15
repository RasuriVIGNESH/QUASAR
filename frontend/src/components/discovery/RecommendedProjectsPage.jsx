import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ChevronRight, Sparkles, ArrowLeft, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import recommendationService from '../../services/recommendationService';
import { joinRequestService } from '../../services/JoinRequestService';
import ProjectDetailModal from './ProjectDetailModal';

const unwrapData = response => { const envelope = response?.data ?? response; return envelope?.data ?? envelope; };
const pageContent = response => { const body = unwrapData(response); return { body, content: Array.isArray(body) ? body : body?.content || [] }; };
const normalizeProject = result => {
  const project = result?.project || result;
  return {
    ...project,
    id: project?.id || result?.projectId,
    matchScore: result?.matchScore ?? project?.matchScore,
    matchedSkills: result?.matchedSkills || [],
    missingSkills: result?.missingSkills || [],
    reasons: result?.reasons || [],
    requiredSkills: project?.skillsRequired || project?.requiredSkills || result?.matchedSkills || [],
    lead: project?.Lead || project?.lead,
  };
};

export default function RecommendedProjectsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [feedbackBusy, setFeedbackBusy] = useState({});
  const [viewMode, setViewMode] = useState('recommended');
  const [error, setError] = useState('');

  const fetchRecommendations = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = viewMode === 'saved' ? await recommendationService.getSavedProjects(page, 20) : await recommendationService.getRecommendedProjects(page, 20);
      const { body, content } = pageContent(response);
      setProjects(content.map(normalizeProject));
      setTotalPages(body?.totalPages ?? (content.length === 20 ? page + 2 : page + 1));
    } catch (err) {
      setError(err.message || 'Could not load recommendations');
      toast.error(err.message || 'Could not load recommendations');
    } finally { setLoading(false); }
  }, [page, viewMode]);

  useEffect(() => {
    fetchRecommendations();
    joinRequestService.getMyJoinRequests().then(response => {
      const { content } = pageContent(response);
      setSentRequests(new Set(content.map(request => request.projectId).filter(Boolean)));
    }).catch(() => {});
  }, [fetchRecommendations]);

  const handleFeedback = async (projectId, action) => {
    setFeedbackBusy(prev => ({ ...prev, [projectId]: action }));
    try {
      await recommendationService.sendProjectFeedback(projectId, action);
      if (action !== 'SAVED') setProjects(prev => prev.filter(project => project.id !== projectId));
      else toast.success('Project saved');
    } catch (err) { toast.error(err.message || 'Could not update recommendation'); }
    finally { setFeedbackBusy(prev => ({ ...prev, [projectId]: null })); }
  };

  return <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
    <header className="sticky top-0 z-20 w-full h-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-indigo-600" /><h1 className="text-xl font-black text-slate-900 tracking-tight">Recommended For You</h1></div></div>
      <div className="flex items-center gap-3"><Badge className="bg-indigo-50 text-indigo-700 border-none font-black px-4 py-1.5 text-xs">{viewMode === 'saved' ? 'SAVED PROJECTS' : `${projects.length} MATCHES`}</Badge><Button variant="outline" size="sm" onClick={() => { setViewMode(viewMode === 'saved' ? 'recommended' : 'saved'); setPage(0); }}>{viewMode === 'saved' ? 'Back to recommendations' : 'Saved projects'}</Button></div>
    </header>
    <main className="flex-1 p-5 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full">
      {loading ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <Card key={i} className="border-slate-200 bg-white rounded-2xl"><CardContent className="p-7"><Skeleton className="h-7 w-3/4 mb-4 bg-slate-100" /><Skeleton className="h-4 w-full mb-2 bg-slate-100" /><Skeleton className="h-4 w-2/3 mb-6 bg-slate-100" /></CardContent></Card>)}</div> : error ? <Card className="border-rose-200 bg-white"><CardContent className="py-16 text-center"><p className="text-sm text-rose-600">{error}</p><Button onClick={fetchRecommendations} className="mt-4 bg-indigo-600 text-white">Try again</Button></CardContent></Card> : projects.length === 0 ? <div className="h-96 flex flex-col items-center justify-center text-center"><div className="bg-indigo-50 p-6 rounded-full mb-6 text-indigo-600"><Sparkles size={40} /></div><h3 className="text-2xl font-black text-slate-900 mb-2">{viewMode === 'saved' ? 'No saved projects' : 'No recommendations yet'}</h3><p className="text-slate-500 max-w-sm">Complete your profile and add skills to get personalized project recommendations.</p>{viewMode === 'recommended' && <Button onClick={() => navigate('/profile')} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl">Go to Profile</Button>}</div> : <><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"><AnimatePresence mode="popLayout">{projects.map((project, idx) => <motion.div key={project.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} layout><Card className="bg-white border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col h-full group cursor-pointer" onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}><div className="h-1 bg-gradient-to-r from-indigo-600 to-slate-500" /><CardContent className="p-7 flex flex-col h-full"><div className="flex items-center justify-between mb-5"><div><Badge className="w-fit bg-indigo-50 text-indigo-700 border-none font-black text-[9px] uppercase tracking-wider px-3">{project.matchScore != null ? `${project.matchScore}% MATCH` : 'RECOMMENDED'}</Badge><span className="block text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wider">{project.categoryName || 'Project'}</span></div><div className={`w-2.5 h-2.5 rounded-full ${project.status === 'RECRUITING' ? 'bg-emerald-500' : 'bg-slate-300'}`} /></div><h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">{project.title || 'Untitled project'}</h3><p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3">{project.description || 'Project ready for collaboration.'}</p>{project.reasons.length > 0 && <p className="text-xs text-indigo-600 font-semibold line-clamp-2 mb-4">{project.reasons.join(' ')}</p>}<div className="flex flex-wrap gap-1.5 mb-6">{project.matchedSkills.slice(0, 3).map(skill => <span key={skill} className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase">{skill}</span>)}{project.missingSkills.slice(0, 2).map(skill => <span key={`missing-${skill}`} className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">Needs {skill}</span>)}</div><div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between"><div className="flex items-center gap-2 text-slate-500 text-xs font-bold"><Users className="h-4 w-4" /><span>{project.currentTeamSize ?? 0}/{project.maxTeamSize ?? 0} Members</span></div><ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-600 transition-all" /></div><div className="flex items-center gap-2 mt-4" onClick={event => event.stopPropagation()}><Button size="sm" variant="outline" disabled={!!feedbackBusy[project.id]} onClick={() => handleFeedback(project.id, 'SAVED')}><Star size={14} className="mr-1" /> Save</Button><Button size="sm" variant="ghost" disabled={!!feedbackBusy[project.id]} onClick={() => handleFeedback(project.id, 'DISMISSED')}>Dismiss</Button><Button size="sm" variant="ghost" disabled={!!feedbackBusy[project.id]} onClick={() => handleFeedback(project.id, 'NOT_RELEVANT')}>Not relevant</Button></div></CardContent></Card></motion.div>)}</AnimatePresence></div>{totalPages > 1 && <div className="flex items-center justify-center gap-3 mt-8"><Button variant="outline" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous</Button><span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span><Button variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage(value => value + 1)}>Next</Button></div>}</>}
    </main>
    <ProjectDetailModal project={selectedProject} open={isModalOpen} onOpenChange={setIsModalOpen} onJoinSuccess={projectId => setSentRequests(prev => new Set(prev).add(projectId))} />
  </div>;
}
