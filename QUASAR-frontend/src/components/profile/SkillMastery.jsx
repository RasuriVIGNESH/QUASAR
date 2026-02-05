import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import {
    TrendingUp, Plus, Search, ArrowLeft, Star, BookOpen,
    Target, Edit3, Trash2, AlertCircle, Code, Palette,
    BarChart3, Smartphone, Settings, Check, ChevronsUpDown, X, Sparkles, Award,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import skillsService from '../../services/skillsService';

export default function Skills() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Data States
    const [userSkills, setUserSkills] = useState([]);
    const [predefinedSkills, setPredefinedSkills] = useState([]);
    const [staticSkillList, setStaticSkillList] = useState([]);
    const [skillCategories, setSkillCategories] = useState([]);

    // UI & Loading States
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [openPopover, setOpenPopover] = useState(false);

    // Form States
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillCategory, setNewSkillCategory] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState('BEGINNER');
    const [newSkillExperience, setNewSkillExperience] = useState('');
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const scrollRefs = useRef({});

    const scroll = (cat, direction) => {
        const container = scrollRefs.current[cat];
        if (container) {
            const scrollAmount = container.clientWidth; // Scroll one full view (3 cards)
            container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    // Feedback
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const proficiencyLevels = [
        { value: 'BEGINNER', label: 'Beginner', color: 'bg-slate-400', percentage: 25 },
        { value: 'INTERMEDIATE', label: 'Intermediate', color: 'bg-slate-500', percentage: 50 },
        { value: 'ADVANCED', label: 'Advanced', color: 'bg-slate-600', percentage: 75 },
        { value: 'VIBE_CODING', label: 'Vibe Coding', color: 'bg-slate-800', percentage: 100 }
    ];

    const categoryIcons = {
        'Programming': <Code className="h-3.5 w-3.5" />,
        'Design': <Palette className="h-3.5 w-3.5" />,
        'Data Science': <BarChart3 className="h-3.5 w-3.5" />,
        'Data': <BarChart3 className="h-3.5 w-3.5" />,
        'Mobile': <Smartphone className="h-3.5 w-3.5" />,
        'Other': <Settings className="h-3.5 w-3.5" />
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
            setSkillCategories(cats?.data || cats || [
                'Programming', 'Design', 'Data Science', 'Mobile Development',
                'DevOps', 'Testing', 'Project Management', 'Other'
            ]);

            const pList = staticSkills?.data || staticSkills || [];
            setPredefinedSkills(pList);
            setStaticSkillList(pList);
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

            // Refresh to get permanent IDs
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

    const handleAddSkill = async (name, cat, level, exp = '0') => {
        const skillName = name || newSkillName;
        if (!skillName.trim()) {
            setError('Skill name is required');
            return;
        }

        const category = cat || newSkillCategory;

        // Local add only
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const skillData = {
            id: tempId,
            skillName: skillName.trim(),
            category: category,
            level: level || newSkillLevel,
            experience: exp || newSkillExperience || '0',
            skill: { name: skillName.trim(), category } // helpful for UI display consistency
        };

        setUserSkills(prev => [...prev, skillData]);

        setNewSkillName(''); setNewSkillCategory(''); setNewSkillLevel('BEGINNER'); setNewSkillExperience('');
        setIsAddDialogOpen(false);
        setMessage('Skill added to draft. Click Save Changes to commit.');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleRemoveSkill = async (skillItem) => {
        const id = skillItem.id || skillItem.skillId || skillItem.skill?.id;
        if (!id) return;

        // If temp, just remove from state
        if (String(id).startsWith('temp-')) {
            setUserSkills(prev => prev.filter(s => s.id !== id));
            return;
        }

        // If persisted, delete immediately (per safety)
        try {
            await skillsService.deleteUserSkill(id);
            setUserSkills(prev => prev.filter(s => (s.id || s.skillId || s.skill?.id) !== id));
            setMessage('Skill removed.');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { setError('Failed to remove skill'); }
    };

    const handleUpdateLevel = async (id, level) => {
        try {
            await skillsService.updateUserSkill(id, { level, experience: '0' });
            const response = await skillsService.getUserSkills();
            setUserSkills(response?.data || response || []);
        } catch (err) { setError('Failed to update level'); }
    };

    const getProficiencyInfo = (level) => proficiencyLevels.find(p => p.value === level) || proficiencyLevels[0];

    const groupedSkills = userSkills.reduce((acc, userSkill) => {
        const category = userSkill.skill?.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(userSkill);
        return acc;
    }, {});

    const filteredPredefined = predefinedSkills.filter(skill => {
        const name = typeof skill === 'string' ? skill : skill?.name || '';
        if (!name) return false;
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        const notAdded = !userSkills.some(us => {
            const usName = us.skill?.name || us.skillName || '';
            return usName.toLowerCase() === name.toLowerCase();
        });
        return matchesSearch && notAdded;
    });

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
            <div className="text-center">
                <div className="relative">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-400 dark:text-slate-600 animate-pulse" />
                    <div className="absolute inset-0 blur-xl bg-slate-200 dark:bg-slate-800 opacity-30 rounded-full animate-pulse" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Loading your skills...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <style>{`
                @keyframes slideInFromTop {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-slide-in { animation: slideInFromTop 0.4s ease-out; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
                .animate-scale-in { animation: scaleIn 0.3s ease-out; }
                .skill-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .skill-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.08);
                }
                .progress-bar {
                    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .backdrop-blur-xs { backdrop-filter: blur(2px); }
            `}</style>

            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-10 animate-slide-in">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/dashboard')}
                            className="hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-200 transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">My Skills</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <Award className="h-3.5 w-3.5" />
                                {userSkills.length} skills in your profile
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {userSkills.some(s => String(s.id).startsWith('temp-')) && (
                            <Button
                                onClick={handleSave}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:shadow-md animate-fade-in"
                            >
                                <Check className="mr-2 h-4 w-4" /> Save Changes
                            </Button>
                        )}
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white shadow-sm transition-all hover:shadow-md">
                                    <Plus className="mr-2 h-4 w-4" /> Add Skill
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] animate-scale-in dark:bg-slate-950 dark:border-slate-800">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold dark:text-white">Add New Skill</DialogTitle>
                                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                                        Enter a skill to add to your profile
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-5 py-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Skill Name</Label>
                                        <Input
                                            placeholder="e.g., React, Photoshop, Public Speaking"
                                            value={newSkillName}
                                            onChange={(e) => setNewSkillName(e.target.value)}
                                            className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
                                        />
                                        {predefinedSkills.length > 0 && (
                                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 max-h-36 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 mt-2 animate-fade-in">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Suggestions</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {predefinedSkills
                                                        .filter(s => {
                                                            const name = typeof s === 'string' ? s : s.name;
                                                            return name?.toLowerCase().includes(newSkillName.toLowerCase());
                                                        })
                                                        .slice(0, 100)
                                                        .map((s, idx) => {
                                                            const name = typeof s === 'string' ? s : s.name;
                                                            const cat = typeof s === 'string' ? '' : s.category;
                                                            return (
                                                                <Badge
                                                                    key={`${name}-${idx}`}
                                                                    variant="outline"
                                                                    className="cursor-pointer bg-white dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 transition-all text-xs px-2 py-0.5"
                                                                    onClick={() => {
                                                                        setNewSkillName(name);
                                                                        if (cat) setNewSkillCategory(cat);
                                                                    }}
                                                                >
                                                                    {name}
                                                                </Badge>
                                                            );
                                                        })}
                                                    {predefinedSkills.filter(s => {
                                                        const name = typeof s === 'string' ? s : s.name;
                                                        return name?.toLowerCase().includes(newSkillName.toLowerCase());
                                                    }).length === 0 && (
                                                            <span className="text-xs text-slate-400 italic">No matching suggestions</span>
                                                        )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</Label>
                                        <Input
                                            placeholder="Type or select a category"
                                            value={newSkillCategory}
                                            onChange={(e) => setNewSkillCategory(e.target.value)}
                                            className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
                                        />
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {skillCategories.slice(0, 8).map(cat => (
                                                <Badge
                                                    key={cat}
                                                    variant={newSkillCategory === cat ? "default" : "outline"}
                                                    className={cn(
                                                        "cursor-pointer transition-all text-xs px-2 py-0.5",
                                                        newSkillCategory === cat
                                                            ? "bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white"
                                                            : "hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:border-slate-400"
                                                    )}
                                                    onClick={() => setNewSkillCategory(cat)}
                                                >
                                                    {cat}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Experience</Label>
                                        <Input
                                            placeholder="e.g., 2 years, Academic, Self-taught"
                                            value={newSkillExperience}
                                            onChange={(e) => setNewSkillExperience(e.target.value)}
                                            className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={() => handleAddSkill()}
                                        className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white w-full sm:w-auto"
                                    >
                                        Add Skill
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-6 animate-fade-in">
                <div className="flex-1 space-y-6">
                    {error && (
                        <Alert variant="destructive" className="animate-slide-in border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-900">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {message && (
                        <Alert className="animate-slide-in border-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-900">
                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <AlertDescription className="text-emerald-700 dark:text-emerald-300">{message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                            placeholder="Search your skills..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-600 transition-colors bg-white dark:bg-slate-900 dark:text-white shadow-sm"
                        />
                    </div>

                    {userSkills.length === 0 ? (
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-scale-in dark:bg-slate-900">
                            <CardContent className="py-16 text-center">
                                <div className="relative inline-block">
                                    <Star className="h-16 w-16 mx-auto mb-4 text-slate-200 dark:text-slate-800" />
                                    <Sparkles className="h-6 w-6 absolute -top-1 -right-1 text-slate-300 dark:text-slate-700" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">No skills added yet</p>
                                <p className="text-sm text-slate-400 mt-1">Start building your profile by adding skills</p>
                            </CardContent>
                        </Card>
                    ) : (
                        Object.entries(groupedSkills).map(([cat, list], catIdx) => (
                            <div key={cat} className="animate-fade-in mb-8" style={{ animationDelay: `${catIdx * 50}ms` }}>
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            {categoryIcons[cat] || categoryIcons['Other']}
                                            <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">{cat}</h3>
                                        </div>
                                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full">
                                            {list.length}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                        onClick={() => setExpandedCategories(prev => {
                                            const next = new Set(prev);
                                            if (next.has(cat)) next.delete(cat);
                                            else next.add(cat);
                                            return next;
                                        })}
                                    >
                                        {expandedCategories.has(cat) ? 'Show Less' : 'View All'} <ChevronRight className={cn("ml-1 h-3 w-3 transition-transform", expandedCategories.has(cat) && "rotate-90")} />
                                    </Button>
                                </div>

                                <div className="relative group">
                                    {list.length > 0 && !expandedCategories.has(cat) && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full shadow-lg bg-white/95 dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 -ml-5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-0 hidden md:flex"
                                                onClick={() => scroll(cat, 'left')}
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full shadow-lg bg-white/95 dark:bg-slate-800/95 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 -mr-5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-0 hidden md:flex"
                                                onClick={() => scroll(cat, 'right')}
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                        </>
                                    )}

                                    <div
                                        ref={el => scrollRefs.current[cat] = el}
                                        className={cn(
                                            "pb-6 pt-2 px-1 -mx-1",
                                            expandedCategories.has(cat)
                                                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                                                : "flex gap-4 overflow-x-auto snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                                        )}
                                    >
                                        {list.map((s, idx) => {
                                            const info = getProficiencyInfo(s.level);
                                            return (
                                                <Card
                                                    key={s.id || s.skillId || Math.random()}
                                                    className={cn(
                                                        "skill-card border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 shrink-0 snap-center transition-all duration-300 group/card",
                                                        expandedCategories.has(cat)
                                                            ? "w-full"
                                                            : "w-[85vw] sm:w-[45vw] md:w-[calc(33.333%-11px)]"
                                                    )}
                                                    style={{ animationDelay: `${idx * 30}ms` }}
                                                >
                                                    <CardHeader className="pb-3 px-4 pt-4 border-b border-slate-50 dark:border-slate-800">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white truncate" title={s.skill?.name || s.skillName}>
                                                                    {s.skill?.name || s.skillName}
                                                                </CardTitle>
                                                                <Badge className={cn(info.color, "text-white mt-2 text-[10px] px-2 py-0.5 font-medium border-0 shadow-sm")}>
                                                                    {info.label}
                                                                </Badge>
                                                            </div>
                                                            <div className="opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveSkill(s)}
                                                                    className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-full"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="px-4 py-4 bg-slate-50/30 dark:bg-slate-800/30">
                                                        <div className="flex justify-between text-[11px] mb-2 text-slate-500 dark:text-slate-400 font-medium">
                                                            <span>Proficiency</span>
                                                            <span className="text-slate-900 dark:text-white">{info.percentage}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mb-4 overflow-hidden">
                                                            <div
                                                                className={cn("progress-bar h-full rounded-full shadow-sm", info.color)}
                                                                style={{ width: `${info.percentage}%` }}
                                                            />
                                                        </div>
                                                        <Select
                                                            value={s.level}
                                                            onValueChange={(val) => handleUpdateLevel(s.id || s.skillId, val)}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                                                {proficiencyLevels.map(p => (
                                                                    <SelectItem key={p.value} value={p.value} className="text-xs dark:text-slate-300">
                                                                        {p.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="w-full lg:w-80 space-y-4">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 animate-fade-in">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                Quick Add
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2.5">
                            {filteredPredefined.slice(0, 6).map((ps, idx) => {
                                const name = typeof ps === 'string' ? ps : ps?.name;
                                const category = typeof ps === 'string' ? 'Other' : ps?.category;
                                return (
                                    <div
                                        key={`${name}-${idx}`}
                                        className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded transition-colors"
                                    >
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                            {name}
                                        </span>
                                        <Select onValueChange={(val) => handleAddSkill(name, category, val)}>
                                            <SelectTrigger className="w-20 h-7 text-[10px] border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 hover:border-slate-300 transition-colors">
                                                <SelectValue placeholder="Add" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                                {proficiencyLevels.map(p => (
                                                    <SelectItem key={p.value} value={p.value} className="text-xs dark:text-slate-300">
                                                        {p.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            })}
                            {filteredPredefined.length === 0 && (
                                <p className="text-sm text-slate-400 text-center py-4">No suggestions available</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 animate-fade-in">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Total Skills</span>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">{userSkills.length}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Advanced+</span>
                                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                    {userSkills.filter(s => ['ADVANCED', 'VIBE_CODING'].includes(s.level)).length}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div >
    );
}