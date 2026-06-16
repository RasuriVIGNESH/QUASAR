// ─── Drop this into your ProjectDiscovery component ───────────────────────────
//
// 1. Add state:
//      const [selectedCategory, setSelectedCategory] = useState('All');
//
// 2. Derive categories from API response (projects is the `content` array):
//      const categories = useMemo(() => {
//          const names = projects.map(p => p.categoryName).filter(Boolean);
//          return ['All', ...new Set(names)];
//      }, [projects]);
//
// 3. Filter displayed projects:
//      const filteredProjects = selectedCategory === 'All'
//          ? projects
//          : projects.filter(p => p.categoryName === selectedCategory);
//
// 4. Render the <CategoryFilter /> below your search bar, passing the props below.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';

/**
 * CategoryFilter
 * Renders the "CATEGORIES" pill-row matching the design in the screenshot.
 *
 * Props:
 *   categories      string[]  - ['All', 'Education Technology', 'Healthcare', ...]
 *   selected        string    - currently active category
 *   onSelect        fn(cat)   - called when a pill is clicked
 */
export function CategoryFilter({ categories = [], selected = 'All', onSelect }) {
    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center gap-1.5 text-slate-400">
                <Filter size={13} strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Categories</span>
            </div>

            {/* Pills */}
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                    const active = cat === selected;
                    return (
                        <button
                            key={cat}
                            onClick={() => onSelect(cat)}
                            className={`
                                px-4 py-1.5 rounded-full text-sm font-medium border transition-all
                                ${active
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                }
                            `}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}


// ─── Example: how to wire it in your ProjectDiscovery page ────────────────────

export function ProjectDiscoveryExample() {
    // Simulated state — replace with your real API data
    const [projects, setProjects] = useState([
        { id: '1', title: 'Peerconnect', categoryName: 'web application' },
        { id: '2', title: 'TriConnect', categoryName: 'Education Technology' },
        { id: '3', title: 'SEWA', categoryName: 'Healthcare' },
    ]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = useMemo(() => {
        const names = projects.map(p => p.categoryName).filter(Boolean);
        return ['All', ...new Set(names)];
    }, [projects]);

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesCategory = selectedCategory === 'All' || p.categoryName === selectedCategory;
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [projects, selectedCategory, searchTerm]);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
            {/* Search bar (your existing one) */}
            <div className="relative">
                <input
                    className="w-full pl-10 pr-4 h-10 rounded-lg border border-slate-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* ← Add CategoryFilter right below search */}
            <CategoryFilter
                categories={categories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
            />

            {/* Project cards (your existing grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map(p => (
                    <div key={p.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                        <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">{p.categoryName}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}