import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Icons - Fixed the missing Zap import
import {
  Search,
  Briefcase,
  Filter,
  ChevronRight,
  Globe,
  Users,
  Target,
  Loader2,
  Sparkles,
  Shapes,
  LayoutGrid,
  GraduationCap,
  ArrowRight,
  Code2,
  Zap // Added Zap here
} from 'lucide-react';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Services
import projectService from '../../services/projectService';
import ProjectDetailModal from './ProjectDetailModal';

/* ─── DESIGN TOKENS ──────────────────────────────────────────────────────── */
const THEME = {
  bg: '#020617',
  surface: '#0B1120',
  border: 'rgba(255,255,255,0.05)',
  accent: '#818CF8',
  highlight: '#22D3EE',
};

/* ─── HOOK: DEBOUNCE ─────────────────────────────────────────────────────── */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

/* ─── SUB-COMPONENT: TEAM METER ─────────────────────────────────────────── */
const TeamMeter = ({ current, max }) => {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
        <span className="text-indigo-400">Team Progress</span>
        <span className={current >= max ? 'text-rose-400' : 'text-cyan-400'}>
          {current} / {max} Seats Filled
        </span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          className={`h-full rounded-full ${current >= max ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'}`}
        />
      </div>
    </div>
  );
};

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function ProjectDiscovery() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Data State
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ─── API CALLS ────────────────────────────────────────────────────────── */

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.searchProjects({
        query: debouncedSearch || undefined,
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
  }, [debouncedSearch, selectedCategory, availableOnly, page]);

  useEffect(() => {
    projectService.getProjectCategories().then(res => {
      const catList = res?.data || res || [];
      setCategories(catList);
    });
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="min-h-screen text-slate-200" style={{ backgroundColor: THEME.bg, fontFamily: '"Outfit", sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,500;1,600&family=Outfit:wght@300;400;500;700;900&display=swap');
        .glass-nav { backdrop-filter: blur(20px) saturate(180%); background: rgba(2, 6, 23, 0.7); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .hero-glow { background: radial-gradient(circle at 50% -20%, rgba(129, 140, 248, 0.12) 0%, transparent 70%); }
      `}</style>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-white/5 glass-nav">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/Logo.png" alt="Quasar" className="w-10 h-10 rounded-xl" loading="lazy" />
              <h1 className="font-serif italic text-2xl text-white tracking-tight">Quasar</h1>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-12 relative group hidden md:block">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} size={16} />
            <input
              placeholder="Search Quasar registry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm font-serif italic focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            <Avatar className="w-9 h-9 border border-indigo-500/30">
              <AvatarImage src={currentUser?.profilePictureUrl} />
              <AvatarFallback className="bg-indigo-600 text-[10px] font-black italic">QS</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 relative hero-glow">
        <div className="grid grid-cols-12 gap-8">

          {/* ── SIDEBAR ── */}
          <aside className="col-span-12 lg:col-span-3 space-y-8">
            <section>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <LayoutGrid size={12} /> Domains
              </h4>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { setSelectedCategory('All'); setPage(0); }}
                  className={`text-left px-5 py-3 rounded-xl text-xs font-bold transition-all ${selectedCategory === 'All' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white/5'}`}
                >
                  Global Discovery
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => { setSelectedCategory(cat.name); setPage(0); }}
                    className={`text-left px-5 py-3 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat.name ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Recruitment</Label>
                <Switch checked={availableOnly} onCheckedChange={(v) => { setAvailableOnly(v); setPage(0); }} />
              </div>
            </section>
          </aside>

          {/* ── FEED ── */}
          <section className="col-span-12 lg:col-span-9">
            {loading && projects.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-72 bg-white/5 rounded-[32px] animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {projects.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => { setSelectedProject(p); setIsModalOpen(true); }}
                      className="group bg-[#0b1120]/50 border border-white/5 rounded-[32px] p-8 hover:bg-[#0b1120] hover:border-indigo-500/40 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">
                          {p.categoryName}
                        </Badge>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      </div>

                      <h3 className="font-serif italic text-2xl text-white group-hover:text-cyan-300 transition-colors mb-4 truncate">
                        {p.title}
                      </h3>

                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {p.skillsRequired?.map((skill) => (
                          <span key={skill} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            <Code2 size={10} className="text-indigo-500" />
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto space-y-6">
                        <TeamMeter current={p.currentTeamSize + 1} max={p.maxTeamSize} />

                        <div className="flex items-center justify-between pt-5 border-t border-white/5">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9 border border-white/10 p-0.5">
                              <AvatarImage src={p.creator?.profilePictureUrl} className="rounded-full" />
                              <AvatarFallback className="bg-slate-800 text-indigo-400 font-black text-[10px]">
                                {p.creator?.firstName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-white uppercase leading-none tracking-tight truncate">
                                {p.creator?.firstName} {p.creator?.lastName === '---' ? '' : p.creator?.lastName}
                              </p>
                              <p className="text-[8px] text-slate-500 font-bold uppercase mt-1 flex items-center gap-1 truncate">
                                <GraduationCap size={10} className="text-indigo-400" />
                                {p.creator?.branch}
                              </p>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                            <ArrowRight size={14} className="text-slate-500 group-hover:text-white" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-3">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${page === i ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <ProjectDetailModal
        project={selectedProject}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}