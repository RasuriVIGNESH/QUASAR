import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Search,
    Plus,
    ArrowLeft,
    Sparkles,
    Trash2,
    CheckCircle,
    TrendingUp,
    Zap,
    Code,
    Database,
    Palette,
    Globe,
    LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import skillsService from '../../services/skillsService';

const AnimatedBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-30 animate-pulse delay-1000" />
    </div>
);

export default function Skills() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [userSkills, setUserSkills] = useState([]);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [skillCategories, setSkillCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');

    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillCategory, setNewSkillCategory] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState('BEGINNER');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const proficiencyLevels = [
        { value: 'BEGINNER', label: 'Beginner', color: 'bg-emerald-500', icon: <Zap className="w-3 h-3" /> },
        { value: 'INTERMEDIATE', label: 'Intermediate', color: 'bg-blue-500', icon: <TrendingUp className="w-3 h-3" /> },
        { value: 'ADVANCED', label: 'Advanced', color: 'bg-purple-500', icon: <Sparkles className="w-3 h-3" /> },
        { value: 'VIBE_CODING', label: 'Pro', color: 'bg-rose-500', icon: <Code className="w-3 h-3" /> }
    ];

    const categoryIcons = {
        'Programming Language': <Code className="w-4 h-4" />,
        'Design': <Palette className="w-4 h-4" />,
        'Style Sheet': <Palette className="w-4 h-4" />,
        'Markup': <Code className="w-4 h-4" />,
        'Data Science': <Database className="w-4 h-4" />,
        'General': <LayoutGrid className="w-4 h-4" />,
        'Web': <Globe className="w-4 h-4" />,
        'Other': <LayoutGrid className="w-4 h-4" />
    };

    useEffect(() => {
        if (currentUser) initializeData();
    }, [currentUser]);

    const initializeData = async () => {
        try {
            setLoading(true);
            const [allSkillsRes, uSkillsRes, catsRes] = await Promise.all([
                skillsService.getAllSkills(0, 100),
                skillsService.getUserSkillsByUserId(currentUser?.id),
                skillsService.getSkillCategories()
            ]);

            setAvailableSkills(allSkillsRes?.data?.content || allSkillsRes?.content || []);
            setUserSkills(uSkillsRes?.data || []);
            setSkillCategories(['All', ...(catsRes?.data || catsRes || [])]);
        } catch (err) {
            setError('Failed to sync with backend.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const drafts = userSkills.filter(s => String(s.id).startsWith('temp-'));
        try {
            setLoading(true);
            await skillsService.addBatchSkills(drafts, currentUser);
            const res = await skillsService.getUserSkillsByUserId(currentUser?.id);
            setUserSkills(res.data || []);
            setMessage('Portfolio synchronized!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError('Failed to save skills.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = () => {
        if (!newSkillName.trim()) return;
        const tempId = `temp-${Date.now()}`;
        setUserSkills(prev => [...prev, {
            id: tempId,
            skillName: newSkillName,
            category: newSkillCategory || 'Other',
            level: newSkillLevel
        }]);
        setNewSkillName('');
        setIsAddDialogOpen(false);
    };

    const handleRemoveSkill = async (id) => {
        if (String(id).startsWith('temp-')) {
            setUserSkills(prev => prev.filter(s => s.id !== id));
            return;
        }
        try {
            await skillsService.deleteUserSkill(id);
            setUserSkills(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            setError('Could not remove skill.');
        }
    };

    const filteredUserSkills = userSkills.filter(s => {
        const name = (s.skillName || '').toLowerCase();
        return name.includes(searchTerm.toLowerCase()) && (activeCategory === 'All' || s.category === activeCategory);
    });

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans relative overflow-x-hidden">
            <AnimatedBackground />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft className="w-5 h-5" /></Button>
                        <h1 className="text-xl font-bold flex items-center gap-2">Skill Arsenal <Sparkles className="w-4 h-4 text-yellow-500" /></h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {userSkills.some(s => String(s.id).startsWith('temp-')) && (
                            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                                <CheckCircle className="w-4 h-4 mr-2" /> Sync Changes
                            </Button>
                        )}
                        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                            <Plus className="w-5 h-5 mr-2" /> New Skill
                        </Button>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto no-scrollbar flex gap-2">
                    {skillCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                                activeCategory === cat ? "bg-white text-slate-900 border-white" : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 relative z-10">
                {/* Left: User Portfolio */}
                <div className="flex-1">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <Input
                            placeholder="Search your mastered skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-14 pl-12 rounded-2xl border-slate-800 bg-slate-900/50 text-lg focus:ring-indigo-500"
                        />
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-800/50 rounded-3xl animate-pulse" />)}
                        </div>
                    ) : filteredUserSkills.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                            <Sparkles className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-400">Your arsenal is empty</h3>
                            <p className="text-slate-600 text-sm">Add skills from the catalog on the right</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredUserSkills.map((skill) => {
                                const prof = proficiencyLevels.find(p => p.value === skill.level) || proficiencyLevels[0];
                                return (
                                    <div key={skill.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl hover:border-indigo-500/50 transition-all group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2 bg-slate-800 rounded-xl">{categoryIcons[skill.category] || <LayoutGrid className="w-4 h-4" />}</div>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveSkill(skill.id)} className="text-slate-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                        <h3 className="font-bold text-white text-lg">{skill.skillName}</h3>
                                        <div className="flex items-center gap-2 mt-1 mb-4">
                                            <Badge className="bg-slate-800 text-slate-400 border-none text-[10px]">{skill.category}</Badge>
                                            <span className={cn("text-[10px] font-black uppercase flex items-center gap-1", prof.color.replace('bg-', 'text-'))}>
                                                {prof.icon} {prof.label}
                                            </span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className={cn("h-full transition-all duration-1000", prof.color)} style={{ width: prof.value === 'VIBE_CODING' ? '100%' : prof.value === 'ADVANCED' ? '75%' : '40%' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="w-full lg:w-80 space-y-6">
                    <Card className="bg-slate-900/50 border-slate-800 p-6 rounded-3xl">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                                <p className="text-2xl font-black text-white">{userSkills.length}</p>
                                <p className="text-[10px] text-slate-500 uppercase">My Skills</p>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                                <p className="text-2xl font-black text-indigo-400">{availableSkills.length}</p>
                                <p className="text-[10px] text-slate-500 uppercase">Global</p>
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 flex items-center gap-2">
                            <Globe className="w-3 h-3" /> Global Skill Catalog
                        </h3>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {availableSkills.map((skill, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-indigo-500/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                                            {categoryIcons[skill.category] || <LayoutGrid className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-white">{skill.name}</p>
                                            <p className="text-[9px] text-slate-500 uppercase">{skill.category}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-indigo-500/20 text-indigo-400"
                                        onClick={() => { setNewSkillName(skill.name); setNewSkillCategory(skill.category); setIsAddDialogOpen(true); }}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white rounded-3xl">
                    <DialogHeader><DialogTitle>Add to Arsenal</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Skill Name</Label>
                            <Input value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} className="bg-slate-800 border-slate-700 h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label>Proficiency</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {proficiencyLevels.map(l => (
                                    <Button
                                        key={l.value}
                                        variant={newSkillLevel === l.value ? "default" : "outline"}
                                        onClick={() => setNewSkillLevel(l.value)}
                                        className={cn("justify-start gap-2 h-12 rounded-xl border-slate-700", newSkillLevel === l.value && "bg-indigo-600 border-indigo-600")}
                                    >
                                        {l.icon} {l.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddSkill} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-2xl">Add Skill</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AnimatePresence>
                {(message || error) && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                        <Alert className={cn("border-none shadow-2xl rounded-2xl px-6 min-w-[300px]", error ? "bg-red-500" : "bg-emerald-500")}>
                            <AlertDescription className="font-bold text-white text-center">{message || error}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}