import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, BookOpen, Building } from 'lucide-react';
import { dataService } from '../../services/dataService.js';

export default function CompleteProfile() {
    const { currentUser, updateUserProfile } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        graduationYear: '',
        branch: '',
        collegeId: ''
    });

    const [staticData, setStaticData] = useState({ branches: [], graduationYears: [], colleges: [] });
    const [isLoadingStaticData, setIsLoadingStaticData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        const fetchStaticData = async () => {
            setIsLoadingStaticData(true);
            try {
                const branchesRes = await dataService.getBranches().catch(() => ({ data: [] }));
                const yearsRes = await dataService.getGraduationYears().catch(() => ({ data: [] }));
                const collegesRes = await dataService.getColleges().catch(() => ({ data: [] }));
                setStaticData({
                    branches: branchesRes.data || [],
                    graduationYears: yearsRes.data || [],
                    colleges: collegesRes.data || []
                });
            } finally {
                setIsLoadingStaticData(false);
            }
        };
        fetchStaticData();
    }, []);

    // Pre-fill data if available in currentUser
    useEffect(() => {
        if (currentUser) {
            setFormData({
                graduationYear: currentUser.graduationYear ? String(currentUser.graduationYear) : '',
                branch: currentUser.branch || '',
                collegeId: currentUser.collegeId || (currentUser.college?.id) || ''
            });
        }
    }, [currentUser]);

    function handleSelectChange(name, value) {
        setFormData(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    function validate() {
        const errs = {};
        if (!formData.collegeId) errs.collegeId = 'Please select your college';

        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!validate()) return;

        try {
            setLoading(true);
            const updates = {
                collegeId: formData.collegeId
            };

            // Only include optional fields if they are selected
            if (formData.graduationYear) {
                updates.graduationYear = parseInt(formData.graduationYear, 10);
            }
            if (formData.branch) {
                updates.branch = formData.branch;
            }

            await updateUserProfile(updates);
            navigate('/onboarding');
        } catch (err) {
            console.error('Profile update error:', err);
            setError('Failed to update profile: ' + (err?.message || 'Please try again.'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="max-w-md w-full space-y-6 relative z-10">
                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <img src="/data/Logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">Quasar</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Complete Your Profile</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Please provide a few more details to get started.</p>
                </div>

                <Card className="border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Essential Details</CardTitle>
                        <CardDescription className="dark:text-slate-400">Tell us about your academic background</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {currentUser && (
                            <div className="flex items-center space-x-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 ring-2 ring-white dark:ring-slate-800">
                                    {currentUser.profileImage ? (
                                        <img
                                            src={currentUser.profileImage}
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-lg">
                                            {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                        {currentUser.firstName} {currentUser.lastName}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                        {currentUser.email}
                                    </p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <Alert className="mb-4" variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* College */}
                            <div className="space-y-1.5">
                                <Label htmlFor="college" className="text-slate-700 dark:text-white font-semibold text-sm">
                                    College <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 z-10" />
                                    <Select
                                        value={formData.collegeId}
                                        onValueChange={(value) => handleSelectChange('collegeId', value)}
                                        disabled={isLoadingStaticData}
                                    >
                                        <SelectTrigger className="pl-10 h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500">
                                            <SelectValue placeholder={isLoadingStaticData ? "Loading..." : "Select your college"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staticData.colleges.map(college => (
                                                <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {fieldErrors.collegeId && <p className="text-xs text-red-500 mt-1">{fieldErrors.collegeId}</p>}
                            </div>

                            {/* Graduation Year */}
                            <div className="space-y-1.5">
                                <Label htmlFor="graduationYear" className="text-slate-700 dark:text-white font-semibold text-sm">
                                    Graduation Year <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
                                </Label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 z-10" />
                                    <Select
                                        value={formData.graduationYear}
                                        onValueChange={(value) => handleSelectChange('graduationYear', value)}
                                        disabled={isLoadingStaticData}
                                    >
                                        <SelectTrigger className="pl-10 h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500">
                                            <SelectValue placeholder={isLoadingStaticData ? "Loading..." : "Select year"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staticData.graduationYears.map(year => (
                                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Branch */}
                            <div className="space-y-1.5">
                                <Label htmlFor="branch" className="text-slate-700 dark:text-white font-semibold text-sm">
                                    Branch / Major <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
                                </Label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500 z-10" />
                                    <Select
                                        value={formData.branch}
                                        onValueChange={(value) => handleSelectChange('branch', value)}
                                        disabled={isLoadingStaticData}
                                    >
                                        <SelectTrigger className="pl-10 h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500">
                                            <SelectValue placeholder={isLoadingStaticData ? "Loading..." : "Select branch"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staticData.branches.map(branch => (
                                                <SelectItem key={branch} value={branch}>
                                                    {branch.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Continue to Dashboard'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
