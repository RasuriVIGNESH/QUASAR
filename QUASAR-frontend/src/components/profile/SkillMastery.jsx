import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import {
    Search,
    Plus,
    ArrowLeft,
    Trash2,
    CheckCircle,
    Globe,
    Zap,
    BarChart3,
    Target,
    Edit3,
    Loader2,
    RefreshCw,
    Layers,
    LayoutGrid,
    Cpu
} from 'lucide-react';

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Services
import skillsService from '../../services/skillsService';

/* ─── CONSTANTS & THEME ──────────────────────────────────────────────────── */
const THEME = {
    bg: '#020617',
    surface: '#0B1120',
    indigo: '#818CF8',
    cyan: '#22D3EE'
};

const LEVELS = [
    { value: 'BEGINNER', label: 'Beginner', short: 'Beg', pct: 25, hue: '#10b981' },
    { value: 'INTERMEDIATE', label: 'Intermediate', short: 'Int', pct: 55, hue: '#3b82f6' },
    { value: 'ADVANCED', label: 'Advanced', short: 'Adv', pct: 85, hue: '#a855f7' },
    { value: 'VIBE_CODING', label: 'Vibe Coding', short: 'Vibe', pct: 100, hue: '#f43f5e' },
];

const getLevel = (v) => LEVELS.find(l => l.value === v) || LEVELS[0];
const getSkillName = (s) => s?.skill?.name || s?.skillName || s?.name || '—';
const getSkillCategory = (s) => s?.skill?.category || s?.category || 'Other';

/* ─── HOOK: DEBOUNCE ─────────────────────────────────────────────────────── */
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

/* ─── COMPONENT: SKILL CARD ─────────────────────────────────────────────── */
const SkillCard = ({ skill, onRemove, onEdit, index }) => {
    const name = getSkillName(skill);
    const cat = getSkillCategory(skill);
    const lvl = getLevel(skill.level);
    const isDraft = String(skill.id).startsWith('temp-');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ delay: index * 0.02 }}
            className="group relative bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 md:p-6 hover:border-indigo-500/30 transition-all duration-300"
        >
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex justify-between items-start mb-5">
                <div className="min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 block mb-1">{cat}</span>
                    <h3 className="font-serif italic text-xl md:text-2xl text-slate-100 leading-tight truncate">{name}</h3>
                </div>
                <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(skill)} className="p-2 text-white/30 hover:text-cyan-400 transition-colors"><Edit3 size={14} /></button>
                    <button onClick={() => onRemove(skill.id)} className="p-2 text-white/30 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">Efficiency</span>
                    <span className="font-serif italic text-xs" style={{ color: lvl.hue }}>{lvl.label}</span>
                </div>
                <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${lvl.pct}%` }}
                        className="h-full"
                        style={{ backgroundColor: lvl.hue, boxShadow: `0 0 10px ${lvl.hue}40` }}
                    />
                </div>
            </div>
            {isDraft && <div className="mt-3 text-[8px] font-black text-amber-500 tracking-widest text-right">UNSAVED TO REGISTRY</div>}
        </motion.div>
    );
};

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function SkillMastery() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // State
    const [userSkills, setUserSkills] = useState([]);
    const [rawRegistry, setRawRegistry] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [loading, setLoading] = useState(true);
    const [regLoading, setRegLoading] = useState(false);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [activeCategory, setActiveCategory] = useState('All');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [formData, setFormData] = useState({ name: '', level: 'BEGINNER', category: 'Other' });
    const [toast, setToast] = useState(null);

    // Initial Data Fetch
    useEffect(() => { if (currentUser) { loadArsenal(); loadMeta(); } }, [currentUser]);

    const loadArsenal = async () => {
        setLoading(true);
        try {
            const res = await skillsService.getUserSkillsByUserId(currentUser?.id);
            setUserSkills(res?.data || []);
        } catch (e) { showToast("Arsenal sync failed", "error"); }
        setLoading(false);
    };

    const loadMeta = async () => {
        try {
            const [catRes, preRes] = await Promise.all([
                skillsService.getSkillCategories(),
                skillsService.getPredefinedSkills()
            ]);
            // Parsing based on your backend response shape
            const catData = catRes?.data || catRes || [];
            setCategories(['All', ...catData.map(c => typeof c === 'string' ? c : c.name)]);
            setRawRegistry(preRes?.data || []);
        } catch (e) { console.error("Metadata load failed"); }
    };

    // Filter Logic: Show only skills user does NOT have
    const filteredRegistry = useMemo(() => {
        const ownedSet = new Set(userSkills.map(s => getSkillName(s).toLowerCase()));
        return rawRegistry.filter(rs => !ownedSet.has(getSkillName(rs).toLowerCase()));
    }, [userSkills, rawRegistry]);

    // Search Logic (Debounced Global Search)
    const handleGlobalSearch = useCallback(async (query) => {
        if (!query) { loadMeta(); return; }
        setRegLoading(true);
        try {
            const res = await skillsService.searchSkills(query, 0, 20);
            setRawRegistry(res?.data?.content || []);
        } catch (e) { console.error("Search failed"); }
        setRegLoading(false);
    }, []);

    useEffect(() => {
        handleGlobalSearch(debouncedSearch);
    }, [debouncedSearch, handleGlobalSearch]);

    // CRUD
    const handleSave = async () => {
        if (!formData.name) return;
        try {
            if (editingSkill && !String(editingSkill.id).startsWith('temp-')) {
                await skillsService.updateUserSkill(editingSkill.id, { level: formData.level, experience: "0" });
                showToast("Entry refined");
            } else {
                const draft = { id: `temp-${Date.now()}`, skill: { name: formData.name, category: formData.category }, level: formData.level };
                setUserSkills(prev => [draft, ...prev]);
                showToast("Added to draft list");
            }
            setDialogOpen(false);
            setEditingSkill(null);
            loadArsenal();
        } catch (e) { showToast("Write error", "error"); }
    };

    const handleSyncBatch = async () => {
        const drafts = userSkills.filter(s => String(s.id).startsWith('temp-'));
        setLoading(true);
        try {
            await skillsService.addBatchSkills(drafts, currentUser);
            showToast("Quasar registry synced");
            loadArsenal();
        } catch (e) { showToast("Batch sync failed", "error"); }
        finally { setLoading(false); }
    };

    const handleRemove = async (id) => {
        try {
            if (!String(id).startsWith('temp-')) await skillsService.deleteUserSkill(id);
            setUserSkills(prev => prev.filter(s => s.id !== id));
            showToast("Capability removed");
        } catch (e) { showToast("Action failed", "error"); }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const arsenalDisplay = userSkills.filter(s => {
        const n = getSkillName(s).toLowerCase().includes(search.toLowerCase());
        const c = activeCategory === 'All' || getSkillCategory(s) === activeCategory;
        return n && c;
    });

    return (
        <div className="min-h-screen text-slate-200 selection:bg-indigo-500/30" style={{ backgroundColor: THEME.bg, fontFamily: '"Outfit", sans-serif' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400;1,500;1,600&family=Outfit:wght@300;400;500;700;900&display=swap');
                .glass-nav { backdrop-filter: blur(20px) saturate(180%); background: rgba(2, 6, 23, 0.7); }
                .hide-scroll::-webkit-scrollbar { display: none; }
                .quasar-glow { background: radial-gradient(circle at 50% -20%, rgba(129, 140, 248, 0.1) 0%, transparent 70%); }
            `}</style>

            {/* ── HEADER ── */}
            <header className="sticky top-0 z-50 border-b border-white/5 glass-nav">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <img src="/Logo.png" alt="Quasar" className="w-10 h-10 rounded-xl" loading="lazy" />
                            <h1 className="font-serif italic text-2xl text-white tracking-tight">Quasar</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {userSkills.some(s => String(s.id).startsWith('temp-')) && (
                            <button onClick={handleSyncBatch} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all rounded-lg shadow-lg shadow-emerald-500/20">
                                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Sync Registry
                            </button>
                        )}
                        <button
                            onClick={() => { setEditingSkill(null); setFormData({ name: '', level: 'BEGINNER', category: 'Other' }); setDialogOpen(true); }}
                            className="bg-white text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all rounded-lg shadow-xl"
                        >
                            + Acquire Skill
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid grid-cols-12 gap-8 lg:gap-12 relative quasar-glow">

                {/* ── SIDEBAR: METRICS ── */}
                <aside className="hidden lg:block lg:col-span-3 space-y-10">
                    <section>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <BarChart3 size={12} /> Analysis
                        </h4>
                        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] space-y-8">
                            <div>
                                <div className="font-serif italic text-5xl text-indigo-400 leading-none">{userSkills.length}</div>
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-3">Active Capabilities</div>
                            </div>
                            <div className="space-y-3 pt-6 border-t border-white/5">
                                {LEVELS.map(l => (
                                    <div key={l.value} className="flex justify-between items-center group">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase group-hover:text-slate-400 transition-colors">{l.short}</span>
                                        <span className="font-serif italic text-base" style={{ color: l.hue }}>
                                            {userSkills.filter(s => s.level === l.value).length}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </aside>

                {/* ── CENTER: ARSENAL ── */}
                <section className="col-span-12 lg:col-span-6">
                    <div className="relative mb-10 group">
                        <Search className={`absolute left-0 top-1/2 -translate-y-1/2 transition-colors ${regLoading ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} size={20} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter arsenal or search Quasar database..."
                            className="w-full bg-transparent border-b border-white/10 py-4 pl-10 text-xl font-serif italic focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-700"
                        />
                    </div>

                    <div className="flex gap-2 mb-8 overflow-x-auto hide-scroll pb-2 touch-pan-x">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/20'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                            {arsenalDisplay.map((s, i) => (
                                <SkillCard key={s.id} skill={s} index={i} onRemove={handleRemove} onEdit={(skill) => { setEditingSkill(skill); setFormData({ name: getSkillName(skill), level: skill.level, category: getSkillCategory(skill) }); setDialogOpen(true); }} />
                            ))}
                        </AnimatePresence>
                    </div>

                    {arsenalDisplay.length === 0 && (
                        <div className="py-32 text-center border border-dashed border-white/5 rounded-[40px]">
                            <Target size={40} className="mx-auto mb-4 text-white/5" />
                            <p className="font-serif italic text-2xl text-slate-700">The arsenal is empty.</p>
                        </div>
                    )}
                </section>

                {/* ── RIGHT: REGISTRY ── */}
                <aside className="col-span-12 lg:col-span-3">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Globe size={12} /> Discovery
                    </h4>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto hide-scroll pr-1">
                        <AnimatePresence mode="popLayout">
                            {filteredRegistry.map((ps) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={getSkillName(ps)}
                                    className="group flex items-center justify-between p-4 bg-[#0b1120]/50 border border-white/5 rounded-2xl hover:border-indigo-500/40 transition-all"
                                >
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-white/80 truncate">{getSkillName(ps)}</div>
                                        <div className="text-[9px] text-slate-500 uppercase tracking-tight mt-0.5">{getSkillCategory(ps)}</div>
                                    </div>
                                    <button
                                        onClick={() => { setFormData({ name: getSkillName(ps), category: getSkillCategory(ps), level: 'BEGINNER' }); setDialogOpen(true); }}
                                        className="p-2 text-white/20 hover:text-cyan-400 transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {filteredRegistry.length === 0 && (
                            <div className="p-10 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
                                <Layers size={24} className="mx-auto mb-3 text-white/5" />
                                <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest leading-relaxed">System Exhausted</p>
                            </div>
                        )}
                    </div>
                </aside>
            </main>

            {/* ── MODAL ── */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-[#0a0a0a] border border-white/10 p-10 rounded-[40px] max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle className="font-serif italic text-3xl text-white">
                            {editingSkill ? 'Refine Logic' : 'Acquire Logic'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-8 my-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Cognitive Identity</label>
                            <input
                                disabled={editingSkill && !String(editingSkill.id).startsWith('temp-')}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-serif italic text-xl focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-30"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Efficiency Grade</label>
                            <div className="grid grid-cols-2 gap-2">
                                {LEVELS.map(l => (
                                    <button
                                        key={l.value}
                                        onClick={() => setFormData({ ...formData, level: l.value })}
                                        className={`p-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all ${formData.level === l.value ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xl' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <button
                            onClick={handleSave}
                            className="w-full bg-indigo-600 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-cyan-500 transition-all shadow-2xl shadow-indigo-500/20"
                        >
                            {editingSkill ? 'Confirm Updates' : 'Add to Quasar Arsenal'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── NOTIFICATIONS ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-10 right-10 z-[100]">
                        <div className={`px-6 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl flex items-center gap-3 ${toast.type === 'error' ? 'bg-rose-600 text-white border-rose-500' : 'bg-white text-black border-white'}`}>
                            {toast.type === 'success' ? <CheckCircle size={16} /> : <RefreshCw size={16} />}
                            {toast.msg}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}