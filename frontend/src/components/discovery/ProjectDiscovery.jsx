import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import projectService from '@/services/projectService';
import ProjectDetailModal from './ProjectDetailModal';

import {
  Search,
  Briefcase,
  Users,
  Loader2,
  Filter,
  ArrowRight,
  Plus,
  Zap
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

/* ─── DEBOUNCE HOOK ─────────────────────────────────────────────────────── */
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/* ─── SUB-COMPONENT: TEAM METER ─────────────────────────────────────────── */
const TeamMeter = ({ current, max }) => {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
        <span className="text-slate-500">Team Capacity</span>
        <span className={current >= max ? 'text-rose-600' : 'text-indigo-600'}>
          {current + 1} / {max}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${current >= max ? 'bg-rose-500' : 'bg-indigo-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default function ProjectDiscovery() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Projects state ──
  const [projects, setProjects] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  // ── Categories state (derived from search results) ──
  const [categories, setCategories] = useState([]);

  // 300ms debounce — prevents firing on every keystroke
  const debouncedSearch = useDebounce(searchInput, 300);

  // ── Fetch projects whenever filters change ──
  useEffect(() => {
    const fetchProjects = async () => {
      // Show skeleton only on first load; spinner for subsequent fetches
      if (projects.length === 0) setLoading(true);
      else setIsValidating(true);

      try {
        // Build params — only include defined, non-empty values
        const params = {
          page,
          size: 9,
          availableOnly,
        };
        // Only add query if the user actually typed something
        if (debouncedSearch.trim()) {
          params.query = debouncedSearch.trim();
        }
        // Only add category if it's not "All"
        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }

        const res = await projectService.searchProjects(params);
        const content = res?.content || res?.data?.content || [];
        setProjects(content);
        setTotalPages(res?.totalPages || 1);

        // Derive category list from returned project data
        setCategories((prev) => {
          const merged = new Set(prev);
          content.forEach((p) => {
            if (p.categoryName) merged.add(p.categoryName);
          });
          return Array.from(merged).sort((a, b) => a.localeCompare(b));
        });
      } catch (err) {
        console.error('Discovery fetch failed', err);
      } finally {
        setLoading(false);
        setIsValidating(false);
      }
    };

    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategory, availableOnly, page]);

  // Reset to page 0 when filters change (but not on page change itself)
  const handleSearchChange = useCallback((e) => {
    setSearchInput(e.target.value);
    setPage(0);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setPage(0);
  }, []);

  const handleAvailableToggle = useCallback((v) => {
    setAvailableOnly(v);
    setPage(0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans">
      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
            <input
              placeholder="Search projects, skills..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full bg-slate-100 border-none rounded-lg py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => navigate('/projects/create')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4 rounded-lg font-bold text-xs"
            >
              <Plus size={14} className="mr-1.5" /> Create
            </Button>
            <Avatar className="w-8 h-8 border border-slate-200">
              <AvatarImage src={currentUser?.profilePictureUrl} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[9px] font-bold">U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── CATEGORIES BAR ── */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Filter size={12} /> Categories
              {isValidating && <Loader2 size={12} className="animate-spin text-indigo-600" />}
            </h2>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <Label htmlFor="recruitment" className="text-xs font-semibold text-slate-600 cursor-pointer">Available Only</Label>
              <Switch id="recruitment" checked={availableOnly} onCheckedChange={handleAvailableToggle} />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => handleCategoryChange('All')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === 'All'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === cat
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── PROJECT FEED ── */}
        {loading && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-20 rounded-lg" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-1.5 pt-2">
                  <Skeleton className="h-6 w-12 rounded-lg" />
                  <Skeleton className="h-6 w-12 rounded-lg" />
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Skeleton className="h-1.5 w-full rounded-full" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-7 w-7 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-lg border border-dashed border-slate-200">
            <Zap size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-bold text-sm">No projects found</p>
            <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or search term.</p>
            <Button
              onClick={() => navigate('/projects/create')}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 h-9 rounded-lg font-bold text-xs"
            >
              <Plus size={14} className="mr-2" /> Create First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => { setSelectedProject(p); setIsModalOpen(true); }}
                className="group bg-white border border-slate-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
              >
                <div className="flex justify-between items-start mb-3">
                  <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[9px] px-2 py-0 rounded-lg">
                    {p.categoryName || p.category?.name || 'Uncategorized'}
                  </Badge>
                  {p.status === 'RECRUITING' && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" /> Hiring
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                  {p.title}
                </h3>

                <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                  {p.description || 'No description provided for this project.'}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {(p.techStack || p.skillsRequired || []).slice(0, 3).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[8px] font-semibold text-slate-500 uppercase tracking-tight">
                      {skill}
                    </span>
                  ))}
                  {(p.techStack || p.skillsRequired || []).length > 3 && (
                    <span className="text-[8px] font-bold text-slate-400">
                      +{(p.techStack || p.skillsRequired).length - 3}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
                  <TeamMeter
                    current={p.currentTeamSize ?? 0}
                    max={p.maxTeamSize || 4}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 border border-slate-100">
                        <AvatarImage src={p.lead?.profilePictureUrl || p.creator?.profilePictureUrl} />
                        <AvatarFallback className="bg-slate-100 text-slate-500 text-[7px] font-bold">
                          {(p.lead?.firstName || p.creator?.firstName || 'U')[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-slate-800 leading-none truncate">
                          {p.lead?.firstName || p.creator?.firstName || 'Unknown'}
                        </p>
                        <p className="text-[8px] text-slate-400 mt-0.5 truncate">
                          {p.lead?.branch || p.creator?.branch || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${page === i
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
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