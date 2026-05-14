import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Search,
  Briefcase,
  Users,
  Loader2,
  LayoutGrid,
  GraduationCap,
  ArrowRight,
  Code2,
  Zap,
  Globe,
  Filter
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import projectService from '../../services/projectService';
import ProjectDetailModal from './ProjectDetailModal';

/* ─── SUB-COMPONENT: TEAM METER ─────────────────────────────────────────── */
const TeamMeter = ({ current, max }) => {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
        <span className="text-slate-500">Team Capacity</span>
        <span className={current >= max ? 'text-rose-600' : 'text-indigo-600'}>
          {current} / {max} Filled
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          className={`h-full rounded-full ${current >= max ? 'bg-rose-500' : 'bg-indigo-600'}`}
        />
      </div>
    </div>
  );
};

export default function ProjectDiscovery() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.searchProjects({
        query: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        availableOnly,
        page,
        size: 9
      });
      const content = res?.content || res?.data?.content || [];
      setProjects(content);
      setTotalPages(res?.totalPages || 1);
    } catch (err) {
      console.error("Discovery Failure", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, availableOnly, page]);

  useEffect(() => {
    projectService.getProjectCategories().then(res => {
      setCategories(res?.data || res || []);
    });
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              placeholder="Search projects, skills, or members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Avatar className="w-8 h-8 border border-slate-200">
              <AvatarImage src={currentUser?.profilePictureUrl} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px] font-bold">U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── TOP CATEGORIES BAR ── */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Filter size={14} /> Explore Domains
            </h2>
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <Label htmlFor="recruitment" className="text-xs font-bold text-slate-600 cursor-pointer">Available Only</Label>
              <Switch id="recruitment" checked={availableOnly} onCheckedChange={(v) => { setAvailableOnly(v); setPage(0); }} />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => { setSelectedCategory('All'); setPage(0); }}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === 'All'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                }`}
            >
              All Projects
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => { setSelectedCategory(cat.name); setPage(0); }}
                className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === cat.name
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── PROJECT FEED ── */}
        {loading && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {projects.map((p, idx) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => { setSelectedProject(p); setIsModalOpen(true); }}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[10px] px-2.5 py-0.5 rounded-lg">
                      {p.categoryName}
                    </Badge>
                    {availableOnly && <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Hiring
                    </div>}
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">
                    {p.title}
                  </h3>

                  <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                    {p.description || "No description provided for this project."}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {p.skillsRequired?.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                        {skill}
                      </span>
                    ))}
                    {p.skillsRequired?.length > 3 && (
                      <span className="text-[10px] font-bold text-slate-400 flex items-center">+{p.skillsRequired.length - 3}</span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-50 space-y-4">
                    <TeamMeter current={p.currentTeamSize + 1} max={p.maxTeamSize} />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7 border border-slate-100">
                          <AvatarImage src={p.creator?.profilePictureUrl} />
                          <AvatarFallback className="bg-slate-100 text-slate-500 text-[8px] font-bold">
                            {p.creator?.firstName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-800 leading-none">
                            {p.creator?.firstName} {p.creator?.lastName}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
                            {p.creator?.branch}
                          </p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border ${page === i
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>

      <ProjectDetailModal
        project={selectedProject}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}