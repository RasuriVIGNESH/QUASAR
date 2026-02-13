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
    LayoutGrid,
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
    Smartphone,
    Globe,
    Server,
    Cpu,
    Briefcase,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import skillsService from '../../services/skillsService';

// --- Animated Background Component ---
const AnimatedBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-30 animate-pulse delay-1000" />
    </div>
);

export default function Skills() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Data States
    const [userSkills, setUserSkills] = useState([]);
    const [predefinedSkills, setPredefinedSkills] = useState([]);
    const [skillCategories, setSkillCategories] = useState([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');

    // Form States
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillCategory, setNewSkillCategory] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState('BEGINNER');

    // Feedback
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const proficiencyLevels = [
        { value: 'BEGINNER', label: 'Beginner', color: 'bg-emerald-500', icon: <Zap className="w-3 h-3" /> },
        { value: 'INTERMEDIATE', label: 'Intermediate', color: 'bg-blue-500', icon: <TrendingUp className="w-3 h-3" /> },
        { value: 'ADVANCED', label: 'Advanced', color: 'bg-purple-500', icon: <Sparkles className="w-3 h-3" /> },
        { value: 'VIBE_CODING', label: 'Pro', color: 'bg-rose-500', icon: <Code className="w-3 h-3" /> }
    ];

    const categoryIcons = {
        'Programming': <Code className="w-4 h-4" />,
        'Design': <Palette className="w-4 h-4" />,
        'Data Science': <Database className="w-4 h-4" />,
        'Mobile': <Smartphone className="w-4 h-4" />,
        'Web': <Globe className="w-4 h-4" />,
        'DevOps': <Server className="w-4 h-4" />,
        'Hardware': <Cpu className="w-4 h-4" />,
        'Business': <Briefcase className="w-4 h-4" />,
        'Other': <LayoutGrid className="w-4 h-4" />
    };

    useEffect(() => {
        if (currentUser) initializeData();
    }, [currentUser]);

    const initializeData = async () => {
        try {
            setLoading(true);
            const [uSkills, cats, staticSkills] = await Promise.all([
                skillsService.getUserSkills(),
                skillsService.getSkillCategories(),
                skillsService.getStaticPredefinedSkills()
            ]);

            setUserSkills(uSkills?.data || uSkills || []);
            setSkillCategories(['All', ...(cats?.data || cats || [])]);
            setPredefinedSkills(staticSkills?.data || staticSkills || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load skills data.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const newSkills = userSkills.filter(s => String(s.id).startsWith('temp-'));
        if (newSkills.length === 0) return;

        try {
            setLoading(true);
            await skillsService.addBatchSkills(newSkills, currentUser);
            const response = await skillsService.getUserSkills();
            setUserSkills(response?.data || response || []);
            setMessage('Changes saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setError('Failed to save changes');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = () => {
        if (!newSkillName.trim()) {
            setError('Skill name is required');
            return;
        }

        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const skillData = {
            id: tempId,
            skillName: newSkillName.trim(),
            category: newSkillCategory || 'Other',
            level: newSkillLevel,
            experience: '0',
            skill: { name: newSkillName.trim(), category: newSkillCategory || 'Other' }
        };

        setUserSkills(prev => [...prev, skillData]);
        setNewSkillName('');
        setNewSkillCategory('');
        setNewSkillLevel('BEGINNER');
        setIsAddDialogOpen(false);
        setMessage('Skill added to draft. Save to commit.');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleRemoveSkill = async (id) => {
        try {
            if (String(id).startsWith('temp-')) {
                setUserSkills(prev => prev.filter(s => s.id !== id));
            } else {
                await skillsService.deleteUserSkill(id);
                setUserSkills(prev => prev.filter(s => s.id !== id));
                setMessage('Skill removed.');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            setError('Failed to remove skill');
        }
    };

    const handleUpdateSkillLevel = async (skillId, newLevel) => {
        try {
            // Optimistic update
            setUserSkills(prev => prev.map(s =>
                s.id === skillId ? { ...s, level: newLevel } : s
            ));

            if (!String(skillId).startsWith('temp-')) {
                await skillsService.updateUserSkill(skillId, { level: newLevel });
                setMessage('Skill level updated.');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to update skill level');
        }
    };

    const getProficiency = (level) => proficiencyLevels.find(p => p.value === level) || proficiencyLevels[0];

    const filteredSkills = userSkills.filter(skill => {
        const matchesSearch = (skill.skillName || skill.skill?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || (skill.category || skill.skill?.category) === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans relative">
            <AnimatedBackground />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                Skill Mastery <Sparkles className="w-4 h-4 text-yellow-500" />
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {userSkills.some(s => String(s.id).startsWith('temp-')) && (
                            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
                                <CheckCircle className="w-4 h-4 mr-2" /> Save Changes
                            </Button>
                        )}
                        <Button
                            onClick={() => setIsAddDialogOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all hover:scale-105"
                        >
                            <Plus className="w-5 h-5 mr-2" /> Add Skill
                        </Button>
                    </div>
                </div>

                {/* Categories Bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-x-auto no-scrollbar flex gap-2 border-t border-slate-100 dark:border-slate-800/50">
                    {skillCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                                activeCategory === cat
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md transform scale-105"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700"
                            )}
                        >
                            {categoryIcons[cat] || categoryIcons['Other']}
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 relative z-10">
                {/* --- Left Column: Search & Skills Grid --- */}
                <div className="flex-1 min-w-0">
                    {/* Search Bar */}
                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Find a skill in your arsenal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-14 pl-12 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900/50 dark:text-white text-lg placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    {/* Feedback Messages */}
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="fixed bottom-8 right-8 z-50"
                            >
                                <Alert className="bg-emerald-500 text-white border-none shadow-xl rounded-2xl">
                                    <CheckCircle className="h-5 w-5" />
                                    <AlertDescription className="font-semibold ml-2">{message}</AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Skills Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                            ))}
                        </div>
                    ) : filteredSkills.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No skills found</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Try searching for something else or add a new skill to get started.</p>
                        </div>
                    ) : (
                        <div className="columns-1 md:columns-2 gap-6 space-y-6 pb-20">
                            <AnimatePresence>
                                {filteredSkills.map((skill, index) => {
                                    const proficiency = getProficiency(skill.level);
                                    return (
                                        <motion.div
                                            key={skill.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                            className="break-inside-avoid"
                                        >
                                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800 group relative overflow-hidden">
                                                {/* Decorative Background Icon */}
                                                <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12 transform scale-150 transition-transform group-hover:scale-[1.75] dark:opacity-[0.03]">
                                                    {categoryIcons[skill.category || 'Other']}
                                                </div>

                                                <div className="flex justify-between items-start mb-4 relative z-10">
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                                                        {categoryIcons[skill.category || 'Other']}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveSkill(skill.id)}
                                                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div className="relative z-10">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                                        {skill.skillName || skill.skill?.name}
                                                    </h3>
                                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                                                        {skill.category || skill.skill?.category}
                                                    </p>

                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Select
                                                            value={skill.level}
                                                            onValueChange={(val) => handleUpdateSkillLevel(skill.id, val)}
                                                        >
                                                            <SelectTrigger className="h-8 border-none bg-transparent shadow-none p-0 w-auto ring-0 focus:ring-0">
                                                                <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-2 py-1 transition-colors">
                                                                    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-opacity-10 dark:bg-opacity-20", proficiency.color.replace('bg-', 'text-'))}>
                                                                        {proficiency.icon}
                                                                        {proficiency.label}
                                                                    </span>
                                                                </div>
                                                            </SelectTrigger>
                                                            <SelectContent className="dark:bg-slate-900 dark:border-slate-800 min-w-[140px]">
                                                                {proficiencyLevels.map(l => (
                                                                    <SelectItem key={l.value} value={l.value} className="dark:text-slate-300 text-xs">
                                                                        <div className="flex items-center gap-2">
                                                                            {l.icon} {l.label}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-full transition-all duration-1000", proficiency.color)}
                                                            style={{ width: proficiency.value === 'VIBE_CODING' ? '100%' : proficiency.value === 'ADVANCED' ? '75%' : proficiency.value === 'INTERMEDIATE' ? '50%' : '25%' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* --- Right Column: Stats & Suggestions --- */}
                <div className="w-full lg:w-80 flex-shrink-0 space-y-8">
                    {/* Stats Card */}
                    <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-none shadow-sm rounded-3xl p-6">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-slate-500" /> Mastery Overview
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Skills</span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white">{userSkills.length}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Tier</span>
                                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                    {userSkills.filter(s => s.level === 'ADVANCED' || s.level === 'VIBE_CODING').length}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Suggested Skills Section */}
                    {predefinedSkills.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 px-2">
                                <Zap className="w-4 h-4 text-yellow-500" /> Suggested for You
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {predefinedSkills
                                    .filter(s => {
                                        const name = typeof s === 'string' ? s : s.name;
                                        return !userSkills.some(us => (us.skillName || us.skill?.name || '').toLowerCase() === name.toLowerCase());
                                    })
                                    .sort(() => 0.5 - Math.random()) // Shuffle
                                    .slice(0, 5)
                                    .map((skill, index) => {
                                        const name = typeof skill === 'string' ? skill : skill.name;
                                        const cat = (typeof skill === 'object' && skill.category) ? skill.category : 'Other';
                                        return (
                                            <motion.button
                                                key={index}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                                                    const skillData = {
                                                        id: tempId,
                                                        skillName: name,
                                                        category: cat, // Use the extracted category directly
                                                        level: 'BEGINNER',
                                                        experience: '0',
                                                        skill: { name: name, category: cat } // Ensure nested skill object has category
                                                    };
                                                    setUserSkills(prev => [...prev, skillData]);
                                                    setMessage(`${name} added.`);
                                                    setTimeout(() => setMessage(''), 3000);
                                                }}
                                                className="group flex items-center justify-between p-3 bg-white dark:bg-slate-900/80 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all w-full text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                                                        {categoryIcons[cat] || categoryIcons['Other']}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                                            {name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Plus className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                            </motion.button>
                                        );
                                    })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Skill Dialog */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogContent className="rounded-3xl dark:bg-slate-900 dark:border-slate-800 sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold dark:text-white">Add New Skill</DialogTitle>
                            <DialogDescription className="dark:text-slate-400">Expand your professional repertoire.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label className="font-semibold dark:text-slate-300">Skill Name</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="e.g. React, Python, Leadership..."
                                        value={newSkillName}
                                        onChange={(e) => setNewSkillName(e.target.value)}
                                        className="h-12 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white pl-11"
                                    />
                                    <Sparkles className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                </div>
                                {/* Suggestions Cloud */}
                                {newSkillName && (
                                    <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
                                        {predefinedSkills
                                            .filter(s => (typeof s === 'string' ? s : s.name).toLowerCase().includes(newSkillName.toLowerCase()))
                                            .slice(0, 5)
                                            .map((s, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                                    onClick={() => {
                                                        const name = typeof s === 'string' ? s : s.name;
                                                        const cat = typeof s === 'string' ? '' : s.category;
                                                        setNewSkillName(name);
                                                        if (cat) setNewSkillCategory(cat);
                                                    }}
                                                >
                                                    {typeof s === 'string' ? s : s.name}
                                                </Badge>
                                            ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="font-semibold dark:text-slate-300">Category</Label>
                                <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
                                    <SelectTrigger className="h-12 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                        {skillCategories.filter(c => c !== 'All' && c && c.trim() !== '').map(cat => (
                                            <SelectItem key={cat} value={cat} className="dark:text-slate-300">{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-semibold dark:text-slate-300">Proficiency Level</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {proficiencyLevels.map((level) => (
                                        <button
                                            key={level.value}
                                            onClick={() => setNewSkillLevel(level.value)}
                                            className={cn(
                                                "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                                                newSkillLevel === level.value
                                                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-400 ring-1 ring-indigo-500"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 dark:text-slate-400"
                                            )}
                                        >
                                            {level.icon}
                                            <span className="text-sm font-medium">{level.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddSkill} className="w-full h-12 text-lg font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white">
                                Add Skill
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}