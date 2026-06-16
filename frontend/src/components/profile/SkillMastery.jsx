import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Plus, Trash2, TrendingUp, Zap, Search,
    Code, Loader2, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

import { skillsService } from '@/services/skillsService';

const LEVELS = ['VIBE_CODING', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export default function SkillMastery() {
    const { userProfile } = useAuth();
    const [skills, setSkills] = useState([]);
    const [predefinedSkills, setPredefinedSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [updatingLevel, setUpdatingLevel] = useState(null); // skillId being updated

    useEffect(() => {
        const fetchSkillsData = async () => {
            try {
                setLoading(true);
                const [userSkillsRes, predData] = await Promise.all([
                    skillsService.getUserSkillsByUserId(userProfile?.id),
                    skillsService.getPredefinedSkills()
                ]);
                setSkills(userSkillsRes?.data || []);
                setPredefinedSkills(
                    Array.isArray(predData?.data) ? predData.data : []
                );
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
            case 'ADVANCED': return 100;
            case 'INTERMEDIATE': return 80;
            case 'BEGINNER': return 60;
            case 'VIBE_CODING': return 30;
            default: return 10;
        }
    };

    const getProgressColor = (level) => {
        const pct = mapLevelToPct(level);
        if (pct >= 80) return "bg-emerald-500";
        if (pct >= 50) return "bg-indigo-500";
        return "bg-amber-500";
    };

    const getLevelColor = (level) => {
        switch (level?.toUpperCase()) {
            case 'EXPERT': return 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100';
            case 'ADVANCED': return 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100';
            case 'INTERMEDIATE': return 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100';
            default: return 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100';
        }
    };

    const getNextLevel = (currentLevel) => {
        const idx = LEVELS.indexOf(currentLevel?.toUpperCase());
        if (idx === -1 || idx === LEVELS.length - 1) return LEVELS[0];
        return LEVELS[idx + 1];
    };

    const handleUpdateLevel = async (item) => {
        const nextLevel = getNextLevel(item.level);
        try {
            setUpdatingLevel(item.id);
            await skillsService.updateUserSkill(item.id, {
                level: nextLevel,
                experience: item.experience || ''
            });
            setSkills(prev =>
                prev.map(s => s.id === item.id ? { ...s, level: nextLevel } : s)
            );
            toast.success(`${item.skill?.name} → ${nextLevel}`);
        } catch (err) {
            console.error('Update Level Error:', err);
            toast.error('Failed to update proficiency');
        } finally {
            setUpdatingLevel(null);
        }
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
            const skillData = {
                skillName: name,
                category: 'General',
                level: 'BEGINNER',
                experience: '0'
            };
            const response = await skillsService.addUserSkill(skillData, userProfile);
            if (response) {
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
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Skills & Mastery</h2>
                    <p className="text-xs text-slate-500 font-semibold">Track your technical expertise and proficiency levels.</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: SKILLS LIST */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* SEARCH */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <Input
                                className="pl-10 bg-white border-slate-200 h-10 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                                placeholder="Search your registered skills..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* SKILLS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <Card key={i} className="border-slate-200 rounded-lg bg-white shadow-sm">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Skeleton className="h-10 w-10 rounded-lg" />
                                                    <div className="space-y-2 flex-1">
                                                        <Skeleton className="h-4 w-20" />
                                                        <Skeleton className="h-3 w-16" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-4 w-4" />
                                            </div>
                                            <Skeleton className="h-1.5 w-full rounded-full" />
                                        </CardContent>
                                    </Card>
                                ))
                            ) : filteredUserSkills.length === 0 ? (
                                <div className="col-span-full py-16 text-center bg-white rounded-lg border border-dashed border-slate-200">
                                    <Zap size={32} className="mx-auto text-slate-200 mb-3" />
                                    <p className="text-slate-400 font-bold text-sm">No skills yet</p>
                                    <p className="text-slate-300 text-xs mt-1">Add your first skill to get started</p>
                                </div>
                            ) : (
                                filteredUserSkills.map(item => (
                                    <Card key={item.id} className="border-slate-200 rounded-lg bg-white hover:border-indigo-200 hover:shadow-md transition-all group shadow-sm">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                        <Code size={16} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 text-sm truncate">{item.skill?.name}</p>
                                                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[8px] border-none font-bold uppercase mt-1">
                                                            {item.skill?.category}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteSkill(item.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                                                >
                                                    {deleting === item.id
                                                        ? <Loader2 className="animate-spin" size={14} />
                                                        : <Trash2 size={14} />}
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                                    <span>Proficiency</span>
                                                    {/* Clickable level badge — cycles to next level */}
                                                    <button
                                                        onClick={() => handleUpdateLevel(item)}
                                                        disabled={updatingLevel === item.id}
                                                        title={`Upgrade to ${getNextLevel(item.level)}`}
                                                        className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-tight transition-all ${getLevelColor(item.level)}`}
                                                    >
                                                        {updatingLevel === item.id
                                                            ? <Loader2 className="animate-spin" size={10} />
                                                            : <ChevronUp size={10} />}
                                                        {item.level}
                                                    </button>
                                                </div>
                                                <Progress
                                                    value={mapLevelToPct(item.level)}
                                                    className="h-1.5 bg-slate-100"
                                                    indicatorClassName={getProgressColor(item.level)}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: MANUAL ENTRY & RECOMMENDATIONS */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* ADD SKILL CARD */}
                        <Card className="border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Add Skill</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-2.5">
                                    <Input
                                        placeholder="e.g. React, AWS, Docker"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                                        className="rounded-lg border-slate-200 h-9 text-sm"
                                    />
                                    <Button
                                        onClick={() => handleAddSkill()}
                                        disabled={adding}
                                        className="bg-indigo-600 hover:bg-indigo-700 w-full h-9 rounded-lg shadow-sm font-bold text-sm"
                                    >
                                        {adding ? <Loader2 className="animate-spin h-4 w-4" /> : <><Plus size={16} className="mr-2" /> Add</>}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SUGGESTIONS CARD */}
                        <Card className="border-indigo-100 bg-indigo-50/30 rounded-lg overflow-hidden shadow-sm">
                            <CardHeader className="border-b border-indigo-100 bg-white/50 py-3 px-4">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
                                    <TrendingUp size={14} /> Suggestions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-2">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <Skeleton key={i} className="h-10 rounded-lg" />
                                    ))
                                ) : suggestedSkills.length === 0 ? (
                                    <p className="text-xs text-slate-400 text-center py-4">All suggestions integrated.</p>
                                ) : (
                                    suggestedSkills.slice(0, 6).map(ps => (
                                        <div key={ps.name} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-indigo-50 shadow-sm group hover:border-indigo-200 transition-all">
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-800 truncate">{ps.name}</p>
                                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight truncate">{ps.category}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={adding}
                                                onClick={() => handleAddSkill(ps.name)}
                                                className="h-7 w-7 p-0 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white shrink-0"
                                            >
                                                <Plus size={14} />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}