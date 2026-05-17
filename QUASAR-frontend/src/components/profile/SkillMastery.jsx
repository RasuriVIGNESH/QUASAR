import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Plus, Trash2, TrendingUp, Zap, Search,
    Code, Loader2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Import the skills service
import { skillsService } from '@/services/skillsService';

export default function SkillMastery() {
    const { userProfile } = useAuth();
    const [skills, setSkills] = useState([]);
    const [predefinedSkills, setPredefinedSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        const fetchSkillsData = async () => {
            try {
                setLoading(true);

                // Use service to get user skills and predefined list
                const [userSkillsRes, predData] = await Promise.all([
                    skillsService.getUserSkillsByUserId(userProfile?.id),
                    skillsService.getPredefinedSkills()
                ]);

                // Set user skills (service returns { data: [] })
                setSkills(userSkillsRes?.data || []);

                // Set predefined skills
                // Service already handles the Object.entries transformation 
                setPredefinedSkills(predData?.data || []);

            } catch (err) {
                console.error('Fetch Error:', err);
                toast.error('Failed to sync skill registry');
            } finally {
                setLoading(false);
            }
        };

        if (userProfile?.id) fetchSkillsData();
    }, [userProfile?.id]);

    const mapLevelToPct = (level) => {
        switch (level?.toUpperCase()) {
            case 'EXPERT': return 100;
            case 'ADVANCED': return 80;
            case 'INTERMEDIATE': return 60;
            case 'BEGINNER': return 30;
            default: return 10;
        }
    };

    const getProgressColor = (level) => {
        const pct = mapLevelToPct(level);
        if (pct >= 80) return "bg-emerald-500";
        if (pct >= 50) return "bg-indigo-500";
        return "bg-amber-500";
    };

    const filteredUserSkills = skills.filter(item => {
        const name = item.skill?.name?.toLowerCase() || "";
        return name.includes(searchTerm.toLowerCase());
    });

    const suggestedSkills = useMemo(() => {
        const userSkillNames = new Set(skills.map(s => s.skill?.name?.toLowerCase()));
        return predefinedSkills.filter(ps => !userSkillNames.has(ps.name.toLowerCase()));
    }, [skills, predefinedSkills]);

    const handleAddSkill = async (skillName) => {
        const name = skillName || newSkill;
        if (!name.trim()) return;

        try {
            setAdding(true);

            // Map UI data to service requirements
            const skillData = {
                skillName: name,
                category: 'General',
                level: 'BEGINNER',
                experience: '0'
            };

            const response = await skillsService.addUserSkill(skillData, userProfile);

            if (response) {
                // If the response is the skill object directly or inside .data
                const addedSkill = response.data || response;
                setSkills(prev => [addedSkill, ...prev]);
                setNewSkill('');
                toast.success(`${name} added!`);
            }
        } catch (err) {
            console.error('Add Skill Error:', err);
            toast.error(err.message || 'Failed to add skill');
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteSkill = async (id) => {
        try {
            setDeleting(id);
            await skillsService.deleteUserSkill(id);

            setSkills(prev => prev.filter(s => s.id !== id));
            toast.success('Skill removed');
        } catch (err) {
            console.error('Delete Skill Error:', err);
            toast.error('Action failed');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-8 py-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Skills & Mastery</h2>
                    <p className="text-sm text-slate-500 font-medium">Quantify your technical expertise and intelligence.</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: SEARCH & SKILLS LIST (COL 8) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* SEARCH */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            <Input
                                className="pl-12 bg-white border-slate-200 h-12 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                placeholder="Search your registered skills..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* SKILLS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {loading ? (
                                [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)
                            ) : filteredUserSkills.length === 0 ? (
                                <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                                    <Zap size={40} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Registry Empty</p>
                                </div>
                            ) : (
                                filteredUserSkills.map(item => (
                                    <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <Card className="hover:shadow-md transition-all border-slate-200 rounded-2xl group">
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                            <Code size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{item.skill?.name}</p>
                                                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] border-none font-bold uppercase mt-1">
                                                                {item.skill?.category}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleDeleteSkill(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                                                        {deleting === item.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                        <span>Logic Level</span>
                                                        <span className="text-indigo-600 font-bold">{item.level}</span>
                                                    </div>
                                                    <Progress
                                                        value={mapLevelToPct(item.level)}
                                                        className="h-1.5 bg-slate-100"
                                                        indicatorClassName={getProgressColor(item.level)}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: MANUAL ENTRY & RECOMMENDATIONS (COL 4) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Add New Protocol</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-3">
                                    <Input
                                        placeholder="e.g. React, AWS, Docker"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                                        className="rounded-xl border-slate-200 h-11"
                                    />
                                    <Button
                                        onClick={() => handleAddSkill()}
                                        disabled={adding}
                                        className="bg-indigo-600 hover:bg-indigo-700 w-full h-11 rounded-xl shadow-lg shadow-indigo-100 font-bold"
                                    >
                                        {adding ? <Loader2 className="animate-spin" /> : <><Plus size={18} className="mr-2" /> Add Skill</>}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-indigo-100 bg-indigo-50/30 rounded-3xl overflow-hidden">
                            <CardHeader className="border-b border-indigo-100 bg-white/50 py-4 px-6">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                    <TrendingUp size={16} /> Logic suggestions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {suggestedSkills.slice(0, 6).map(ps => (
                                    <div key={ps.name} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-indigo-50 shadow-sm group hover:border-indigo-300 transition-all">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{ps.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate">{ps.category}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={adding}
                                            onClick={() => handleAddSkill(ps.name)}
                                            className="h-8 w-8 p-0 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white shrink-0"
                                        >
                                            <Plus size={18} />
                                        </Button>
                                    </div>
                                ))}
                                {suggestedSkills.length === 0 && !loading && (
                                    <p className="text-xs text-slate-400 text-center py-6">All suggestions integrated.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}