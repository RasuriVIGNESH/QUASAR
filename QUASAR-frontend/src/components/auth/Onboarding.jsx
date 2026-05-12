import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, X, Loader2, Sparkles, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import skillsService from '../../services/skillsService';
import { toast } from "sonner";

export default function Onboarding() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [predefinedSkills, setPredefinedSkills] = useState([]);
    const [userSkills, setUserSkills] = useState([]);

    useEffect(() => {
        const fetch = async () => {
            const [s, u] = await Promise.all([skillsService.getStaticPredefinedSkills(), skillsService.getUserSkillsByUserId(currentUser?.id)]);
            setPredefinedSkills(s?.data || s || []);
            setUserSkills(u?.data || u || []);
            setLoading(false);
        };
        if (currentUser) fetch();
    }, [currentUser]);

    const handleAdd = (name, cat = 'Other') => {
        if (userSkills.some(s => (s.skill?.name || s.skillName) === name)) return;
        setUserSkills([...userSkills, { skillName: name, category: cat, id: `temp-${Date.now()}`, skill: { name, category: cat } }]);
        setSearchTerm('');
    };

    const handleFinish = async () => {
        try {
            setLoading(true);
            const news = userSkills.filter(s => String(s.id).startsWith('temp-'));
            if (news.length > 0) await skillsService.addBatchSkills(news, currentUser);
            toast.success("Profile Updated");
            navigate('/dashboard');
        } catch (err) { toast.error("Sync Failed"); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-white font-sans">
            <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
                <div className="mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                        What’s in your <span className="text-slate-500">Tech Stack?</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                        Add your core competencies so we can match you with projects that need your specific expertise.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-12">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <Input
                                placeholder="Search skills (e.g. React, Python, Figma...)"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-14 pl-12 bg-slate-50 border-slate-200 rounded-xl text-slate-900 text-lg focus:ring-slate-900"
                            />
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Popular Suggestions</p>
                            <div className="flex flex-wrap gap-2">
                                {predefinedSkills
                                    .filter(s => (s.name || s).toLowerCase().includes(searchTerm.toLowerCase()))
                                    .slice(0, 18)
                                    .map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAdd(s.name || s)}
                                            className="px-4 py-2 border border-slate-200 text-sm font-medium text-slate-600 rounded-lg hover:border-slate-900 hover:text-slate-900 transition-all bg-white"
                                        >
                                            + {s.name || s}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 sticky top-24">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Your Identity Stack</h3>
                            <div className="flex flex-wrap gap-2 mb-10">
                                {userSkills.length === 0 ? (
                                    <div className="py-8 text-center w-full">
                                        <Code2 size={32} className="mx-auto text-slate-200 mb-2" />
                                        <p className="text-xs text-slate-400 italic">No skills selected yet.</p>
                                    </div>
                                ) : (
                                    userSkills.map((s, i) => (
                                        <div key={i} className="bg-slate-900 text-white px-3 py-1.5 flex items-center gap-2 rounded-md text-[11px] font-semibold">
                                            {s.skill?.name || s.skillName}
                                            <X size={14} className="cursor-pointer hover:text-red-400 transition-colors" onClick={() => setUserSkills(userSkills.filter(sk => sk !== s))} />
                                        </div>
                                    ))
                                )}
                            </div>

                            <Button
                                onClick={handleFinish}
                                disabled={loading || userSkills.length === 0}
                                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-200"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Complete Setup"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}