import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ChevronRight, GraduationCap } from 'lucide-react';
import { dataService } from '../../services/dataService.js';
import { motion } from 'framer-motion';

export default function CompleteProfile() {
    const { currentUser, updateUserProfile } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ graduationYear: '', branch: '', collegeId: '' });
    const [staticData, setStaticData] = useState({ branches: [], graduationYears: [], colleges: [] });
    const [loading, setLoading] = useState(false);
    const [isLoadingStatic, setIsLoadingStatic] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [b, y, c] = await Promise.all([dataService.getBranches(), dataService.getGraduationYears(), dataService.getColleges()]);
                setStaticData({ branches: b.data || [], graduationYears: y.data || [], colleges: c.data || [] });
            } finally { setIsLoadingStatic(false); }
        };
        fetch();
    }, []);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                graduationYear: currentUser.graduationYear ? String(currentUser.graduationYear) : '',
                branch: currentUser.branch || '',
                collegeId: currentUser.collegeId || (currentUser.college?.id) || ''
            });
        }
    }, [currentUser]);

    const handleSelectChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const updates = { collegeId: formData.collegeId };
            if (formData.graduationYear) updates.graduationYear = parseInt(formData.graduationYear, 10);
            if (formData.branch) updates.branch = formData.branch;
            await updateUserProfile(updates);
            navigate('/onboarding');
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-6">
                        <GraduationCap className="text-white" size={24} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                        Complete your profile
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Help us match you with the right teams at your institution.
                    </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-700">University / Institute</Label>
                            <Select value={formData.collegeId} onValueChange={(v) => handleSelectChange('collegeId', v)}>
                                <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-lg text-slate-900 focus:ring-slate-900">
                                    <SelectValue placeholder={isLoadingStatic ? "Loading..." : "Select University"} />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200">
                                    {staticData.colleges.map(c => (
                                        <SelectItem key={c.id} value={c.id} className="text-slate-900">{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-700">Graduation Year</Label>
                                <Select value={formData.graduationYear} onValueChange={(v) => handleSelectChange('graduationYear', v)}>
                                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-lg text-slate-900 focus:ring-slate-900">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200">
                                        {staticData.graduationYears.map(y => (
                                            <SelectItem key={y} value={String(y)} className="text-slate-900">{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-700">Major / Branch</Label>
                                <Select value={formData.branch} onValueChange={(v) => handleSelectChange('branch', v)}>
                                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-lg text-slate-900 focus:ring-slate-900">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200">
                                        {staticData.branches.map(b => (
                                            <SelectItem key={b} value={b} className="text-slate-900">{b.replace(/_/g, ' ')}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full h-12 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all mt-4 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
                            {!loading && <ChevronRight size={18} />}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}