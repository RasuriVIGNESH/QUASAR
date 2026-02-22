import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Search, Plus, CheckCircle2, ArrowRight, Sparkles, X,
    Github, Linkedin, Globe, Upload, User, Camera, Loader2, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import skillsService from '../../services/skillsService';
import userService from '../../services/userService';
import { toast } from "sonner";
export default function Onboarding() {
    const { currentUser, updateUserProfile } = useAuth();
    const navigate = useNavigate();

    // State
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Skills State
    const [searchTerm, setSearchTerm] = useState('');
    const [predefinedSkills, setPredefinedSkills] = useState([]);
    const [userSkills, setUserSkills] = useState([]);

    // Profile State
    const [profileData, setProfileData] = useState({
        bio: '',
        githubUrl: '',
        linkedinUrl: '',
        websiteUrl: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Load initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [staticSkills, userSkillsData] = await Promise.all([
                    skillsService.getStaticPredefinedSkills(),
                    skillsService.getUserSkills()
                ]);

                setPredefinedSkills(staticSkills?.data || staticSkills || []);
                setUserSkills(userSkillsData?.data || userSkillsData || []);

                // Pre-fill profile data if available
                if (currentUser) {
                    setProfileData({
                        bio: currentUser.bio || '',
                        githubUrl: currentUser.githubUrl || '',
                        linkedinUrl: currentUser.linkedinUrl || '',
                        websiteUrl: currentUser.websiteUrl || ''
                    });
                    if (currentUser.profileImage) {
                        setImagePreview(currentUser.profileImage);
                    }
                }
            } catch (error) {
                console.error('Failed to load initial data:', error);
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    // --- Skills Logic ---
    const handleAddSkill = async (skillName, category = 'Other') => {
        if (userSkills.some(s => (s.skill?.name || s.skillName) === skillName)) {
            toast.info(`${skillName} is already in your profile`);
            return;
        }

        const skillData = {
            skillName: skillName,
            category: category,
            level: 'BEGINNER',
            experience: '0'
        };

        const tempId = `temp-${Date.now()}`;
        const newSkill = { ...skillData, id: tempId, skill: { name: skillName, category } };
        setUserSkills(prev => [...prev, newSkill]);

        toast.success(`Added ${skillName}`);
        setSearchTerm('');
    };

    const handleRemoveSkill = async (skillItem) => {
        const id = skillItem.id || skillItem.skillId || skillItem.skill?.id;
        if (!id) return;

        // If it's a temp ID, just remove from state
        if (String(id).startsWith('temp-')) {
            setUserSkills(prev => prev.filter(s => s.id !== id));
            return;
        }

        // If it's a persisted skill, call API
        try {
            setUserSkills(prev => prev.filter(s => (s.id || s.skillId || s.skill?.id) !== id));
            await skillsService.deleteUserSkill(id);
        } catch (error) {
            console.error('Remove skill error:', error);
            toast.error('Failed to remove skill');
            // Revert state if failed? For now, we assume success or user retries.
        }
    };

    const suggestions = predefinedSkills
        .filter(s => {
            const name = typeof s === 'string' ? s : s.name;
            return name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !userSkills.some(us => (us.skill?.name || us.skillName) === name);
        })
        .slice(0, 8);

    // --- Profile Logic ---
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Navigation Logic ---
    const handleNext = async () => {
        if (step === 1) {
            // Save skills before moving to next step
            try {
                setLoading(true);
                // Filter out skills that are already persisted (don't have temp- prefix)
                // Actually, the batch endpoint might handle duplicates, but safest is to send only new ones
                // OR send ALL and let backend handle it.
                // The requirement implies using the batch endpoint.
                // If I send all `userSkills`, the backend might duplicate them if logic isn't idempotent.
                // However, I constructed `tempId` with `temp-`.
                // I will send only the ones with `temp-` ID to the batch endpoint.
                // Wait, if I refresh, `temp` prefix is lost.
                // I'll filter by `id` string starting with `temp-`.

                const newSkills = userSkills.filter(s => String(s.id).startsWith('temp-'));

                if (newSkills.length > 0) {
                    await skillsService.addBatchSkills(newSkills, currentUser);
                    // Refresh skills from backend to get real IDs
                    const res = await skillsService.getUserSkills();
                    setUserSkills(res?.data || res || []);
                }
                setStep(2);
            } catch (error) {
                console.error("Failed to save skills", error);
                toast.error("Failed to save skills. Please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleFinish = async () => {
        setSubmitting(true);
        try {
            // 1. Upload Image if changed
            if (profileImage) {
                await userService.uploadProfilePicture(profileImage);
            }

            // 2. Update Profile Fields
            const updates = {
                bio: profileData.bio,
                githubUrl: profileData.githubUrl,
                linkedinUrl: profileData.linkedinUrl,
                websiteUrl: profileData.websiteUrl
            };

            // Clean empty strings to null or leave them to be handled by backend
            // userService cleans undefined/null but we might want to send empty strings as is or remove them

            await updateUserProfile(updates);

            toast.success('Profile updated successfully!');
            setTimeout(() => {
                navigate('/dashboard');
            }, 800);
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-[80px]" />
            </div>

            <motion.div
                layout
                className="w-full max-w-5xl relative z-10"
            >
                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Intro & Context (Different for each step) */}
                    <div className="lg:col-span-5 space-y-6 text-center lg:text-left pt-8">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1-text"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-4">
                                        <Sparkles className="h-4 w-4" />
                                        <span>Step 1 of 2</span>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                                        What are your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Superpowers?</span>
                                    </h1>
                                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Add skills to help others find you for collaboration. Don't worry, you can always update this later.
                                    </p>

                                    {/* Selected Skills Summary */}
                                    <div className="mt-8 flex flex-wrap gap-2 justify-center lg:justify-start min-h-[60px]">
                                        <AnimatePresence>
                                            {userSkills.map((s, i) => (
                                                <motion.div
                                                    key={s.id || i}
                                                    layout
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    whileHover={{ scale: 1.05 }}
                                                    className="inline-block"
                                                >
                                                    <Badge
                                                        className="pl-3 pr-1 py-1.5 text-sm bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-800 transition-all group cursor-pointer"
                                                        onClick={() => handleRemoveSkill(s)}
                                                    >
                                                        {s.skill?.name || s.skillName}
                                                        <div className="ml-2 w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-900/50 text-indigo-500 dark:text-indigo-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 group-hover:text-red-500 dark:group-hover:text-red-400 flex items-center justify-center transition-colors">
                                                            <X className="h-3 w-3" />
                                                        </div>
                                                    </Badge>
                                                </motion.div>
                                            ))}
                                            {userSkills.length === 0 && (
                                                <span className="text-slate-400 dark:text-slate-500 italic text-sm py-2">No skills selected yet...</span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2-text"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-4">
                                        <User className="h-4 w-4" />
                                        <span>Step 2 of 2</span>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                                        Complete your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Profile</span>
                                    </h1>
                                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Add a photo and your social links to build trust and let people know where to reach you.
                                    </p>

                                    {/* Preview Card Mini */}
                                    {currentUser && (
                                        <div className="mt-8 relative hidden lg:block">
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 transform rotate-1 rounded-2xl opacity-20 blur-lg"></div>
                                            <Card className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur border-white/50 dark:border-slate-700/50 shadow-xl rounded-2xl overflow-hidden w-64 mx-auto lg:mx-0">
                                                <div className="h-20 bg-gradient-to-r from-slate-800 to-slate-900"></div>
                                                <div className="px-4 pb-4">
                                                    <div className="relative -mt-10 mb-3">
                                                        <div className="h-20 w-20 rounded-full border-4 border-white dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-700 overflow-hidden mx-auto">
                                                            {imagePreview ? (
                                                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-slate-300 dark:text-slate-500">
                                                                    {currentUser.firstName?.[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <h3 className="font-bold text-slate-900 dark:text-white">{currentUser.firstName} {currentUser.lastName}</h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">{currentUser.college?.name || "Student"}</p>
                                                        <div className="flex justify-center gap-2">
                                                            {profileData.githubUrl && <Github className="h-3 w-3 text-slate-400" />}
                                                            {profileData.linkedinUrl && <Linkedin className="h-3 w-3 text-slate-400" />}
                                                            {profileData.websiteUrl && <Globe className="h-3 w-3 text-slate-400" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Interaction Card */}
                    <div className="lg:col-span-7">
                        <Card className="border-0 shadow-2xl shadow-indigo-200/40 dark:shadow-black/50 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden min-h-[500px] flex flex-col">
                            <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
                                <AnimatePresence mode="wait">
                                    {step === 1 ? (
                                        <motion.div
                                            key="step1-content"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6 flex-1"
                                        >
                                            <div className="space-y-4">
                                                <Label className="text-base font-semibold text-slate-700 dark:text-white">Find & Add Skills</Label>
                                                <div className="relative group">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                    <Input
                                                        placeholder="Search e.g. React, Python, Design..."
                                                        className="pl-12 h-14 text-lg bg-slate-50 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 border-transparent dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-0 rounded-2xl transition-all"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        autoFocus
                                                    />
                                                </div>

                                                <div className="min-h-[250px]">
                                                    {loading ? (
                                                        <div className="flex items-center justify-center h-40 space-x-2">
                                                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {searchTerm && suggestions.length === 0 && (
                                                                <div
                                                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer group transition-colors"
                                                                    onClick={() => handleAddSkill(searchTerm)}
                                                                >
                                                                    <span className="font-medium text-slate-700 dark:text-slate-200">Add "{searchTerm}"</span>
                                                                    <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                                        <Plus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="flex flex-wrap gap-2">
                                                                {suggestions.map((s, idx) => {
                                                                    const name = typeof s === 'string' ? s : s.name;
                                                                    const category = typeof s === 'string' ? 'Other' : s.category;
                                                                    return (
                                                                        <motion.button
                                                                            key={`${name}-${idx}`}
                                                                            layout
                                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md transition-all flex items-center gap-2"
                                                                            onClick={() => handleAddSkill(name, category)}
                                                                        >
                                                                            <span>{name}</span>
                                                                            <Plus className="h-3.5 w-3.5 opacity-50" />
                                                                        </motion.button>
                                                                    )
                                                                })}
                                                            </div>

                                                            {!searchTerm && (
                                                                <div className="pt-4">
                                                                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold mb-3">Popular Skills</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {predefinedSkills.slice(0, 10).map((s, idx) => {
                                                                            const name = typeof s === 'string' ? s : s.name;
                                                                            const category = typeof s === 'string' ? 'Other' : s.category;
                                                                            if (userSkills.some(us => (us.skill?.name || us.skillName) === name)) return null;

                                                                            return (
                                                                                <button
                                                                                    key={`pop-${name}-${idx}`}
                                                                                    className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-600"
                                                                                    onClick={() => handleAddSkill(name, category)}
                                                                                >
                                                                                    {name}
                                                                                </button>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
                                                <Button
                                                    className="w-full h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all"
                                                    onClick={handleNext}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        Next Step <ArrowRight className="h-5 w-5" />
                                                    </span>
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="step2-content"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-6 flex-1"
                                        >
                                            {/* Photo Upload */}
                                            <div className="flex items-center gap-6">
                                                <div className="relative group cursor-pointer">
                                                    <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md">
                                                        {imagePreview ? (
                                                            <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                                <User className="h-10 w-10" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <label htmlFor="photo-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                                        <Camera className="h-6 w-6" />
                                                    </label>
                                                    <input
                                                        type="file"
                                                        id="photo-upload"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleImageChange}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">Profile Photo</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Upload a professional picture.</p>
                                                    <Button variant="outline" size="sm" className="h-8" onClick={() => document.getElementById('photo-upload').click()}>
                                                        <Upload className="h-3 w-3 mr-2" /> Upload
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-slate-700 dark:text-white font-semibold">Bio</Label>
                                                    <Textarea
                                                        name="bio"
                                                        placeholder="Tell us a bit about yourself... (e.g. passionate frontend developer, music lover)"
                                                        value={profileData.bio}
                                                        onChange={handleProfileChange}
                                                        className="min-h-[80px] bg-slate-50 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <Label className="text-slate-700 dark:text-white font-semibold">Social Presence</Label>

                                                    <div className="relative">
                                                        <Github className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                                                        <Input
                                                            name="githubUrl"
                                                            placeholder="GitHub Profile URL"
                                                            className="pl-10 bg-slate-50 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800"
                                                            value={profileData.githubUrl}
                                                            onChange={handleProfileChange}
                                                        />
                                                    </div>

                                                    <div className="relative">
                                                        <Linkedin className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                                                        <Input
                                                            name="linkedinUrl"
                                                            placeholder="LinkedIn Profile URL"
                                                            className="pl-10 bg-slate-50 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800"
                                                            value={profileData.linkedinUrl}
                                                            onChange={handleProfileChange}
                                                        />
                                                    </div>

                                                    <div className="relative">
                                                        <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                                                        <Input
                                                            name="websiteUrl"
                                                            placeholder="Personal Website / Portfolio URL"
                                                            className="pl-10 bg-slate-50 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800"
                                                            value={profileData.websiteUrl}
                                                            onChange={handleProfileChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3 mt-auto">
                                                <Button
                                                    variant="outline"
                                                    className="h-12 px-6 font-semibold dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                                                    onClick={handleBack}
                                                    disabled={submitting}
                                                >
                                                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                                                </Button>
                                                <Button
                                                    className="flex-1 h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-all"
                                                    onClick={handleFinish}
                                                    disabled={submitting}
                                                >
                                                    {submitting ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            Go to Dashboard <CheckCircle2 className="h-5 w-5" />
                                                        </span>
                                                    )}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

