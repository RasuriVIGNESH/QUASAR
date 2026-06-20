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
  Zap,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

/* ─── CONSTANTS ─────────────────────────────────────────────────────────── */
const PAGE_SIZE = 9;

// Matches backend ProjectStatus enum exactly (see controller doc comment).
const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Any status' },
  { value: 'RECRUITING', label: 'Recruiting' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

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

/* ─── SUB-COMPONENT: PAGINATION ──────────────────────────────────────────
   Shows a result-count summary plus prev/next + numbered controls.
   Numbers are windowed with ellipses so this stays usable at 30+ pages. */
const Pagination = ({ page, totalPages, totalElements, pageSize, onPageChange }) => {
  if (totalPages <= 1) return null;

  const rangeStart = page * pageSize + 1;
  const rangeEnd = Math.min((page + 1) * pageSize, totalElements);

  // Build a windowed list of page numbers: first, last, current ±1, with
  // null standing in for an ellipsis gap.
  const pageNumbers = useMemo(() => {
    const window = 1;
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
      const isEdge = i === 0 || i === totalPages - 1;
      const isNearCurrent = Math.abs(i - page) <= window;
      if (isEdge || isNearCurrent) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== null) {
        pages.push(null);
      }
    }
    return pages;
  }, [page, totalPages]);

  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <p className="text-[11px] font-semibold text-slate-400">
        Showing <span className="text-slate-600">{rangeStart}–{rangeEnd}</span> of{' '}
        <span className="text-slate-600">{totalElements}</span> projects
      </p>
      <div className="flex justify-center items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          aria-label="Previous page"
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all"
        >
          <ChevronLeft size={14} />
        </button>

        {pageNumbers.map((i, idx) =>
          i === null ? (
            <span key={`gap-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-300 select-none">
              …
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              aria-current={page === i ? 'page' : undefined}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${page === i
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
            >
              {i + 1}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page === totalPages - 1}
          aria-label="Next page"
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default function ProjectDiscovery() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Projects state ──
  const [projects, setProjects] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  // ── Categories state (derived from search results) ──
  const [categories, setCategories] = useState([]);

  // 300ms debounce — prevents firing on every keystroke
  const debouncedSearch = useDebounce(searchInput, 300);

  // The header search box doubles as a skills filter: a comma-separated
  // term list (e.g. "react, figma") is parsed into the skills array,
  // while the full raw string is still sent as the free-text query.
  const searchSkills = useMemo(() => {
    return debouncedSearch
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [debouncedSearch]);

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
          size: PAGE_SIZE,
        };
        // Only add query if the user actually typed something
        if (debouncedSearch.trim()) {
          params.query = debouncedSearch.trim();
        }
        // The same search box also feeds skills, so the backend can match
        // on skills required even though the UI only shows one input.
        if (searchSkills.length > 0) {
          params.skills = searchSkills;
        }
        // Only add category if it's not "All"
        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        // Only add status if a specific one is selected
        if (selectedStatus !== 'ALL') {
          params.status = selectedStatus;
        }

        const res = await projectService.searchProjects(params);
        const content = res?.content || res?.data?.content || [];
        setProjects(content);
        setTotalPages(res?.totalPages || 1);
        setTotalElements(res?.totalElements ?? content.length);

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
  }, [debouncedSearch, searchSkills, selectedCategory, selectedStatus, page]);

  // Reset to page 0 when filters change (but not on page change itself)
  const handleSearchChange = useCallback((e) => {
    setSearchInput(e.target.value);
    setPage(0);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setPage(0);
  }, []);

  const handleStatusChange = useCallback((e) => {
    setSelectedStatus(e.target.value);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    // Jumping pages should bring the feed back into view rather than
    // leaving the user scrolled to wherever the old list ended.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchInput('');
    setSelectedCategory('All');
    setSelectedStatus('ALL');
    setPage(0);
  }, []);

  const hasActiveFilters =
    searchInput.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedStatus !== 'ALL';

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans">
      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
            <input
              placeholder="Search projects or skills (comma separated)..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full bg-slate-100 border-none rounded-lg py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── FILTERS BAR ── */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 whitespace-nowrap">
              <Filter size={12} /> Categories
              {isValidating && <Loader2 size={12} className="animate-spin text-indigo-600" />}
            </h2>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors whitespace-nowrap"
                >
                  <X size={12} /> Clear filters
                </button>
              )}
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={handleStatusChange}
                aria-label="Filter by status"
                className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
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
            {hasActiveFilters ? (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="mt-4 border-slate-200 text-slate-600 px-6 h-9 rounded-lg font-bold text-xs"
              >
                <X size={14} className="mr-2" /> Clear filters
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/projects/create')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 h-9 rounded-lg font-bold text-xs"
              >
                <Plus size={14} className="mr-2" /> Create First Project
              </Button>
            )}
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
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />
      </main>

      <ProjectDetailModal
        project={selectedProject}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}