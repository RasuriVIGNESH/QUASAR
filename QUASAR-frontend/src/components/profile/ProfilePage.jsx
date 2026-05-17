import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Mail, GraduationCap, Github, Linkedin, Globe,
    Camera, Save, Edit3, CheckCircle, AlertTriangle, Loader2,
    MapPin, Briefcase, Link as LinkIcon, Building2, Calendar, User,
    LayoutGrid // FIXED: Added LayoutGrid here
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ProfilePage() {
    const { userProfile, fetchUserProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        graduationYear: '',
        branch: '',
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
        availabilityStatus: 'AVAILABLE',
        location: '',
        collegeName: ''
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                firstName: userProfile.firstName || '',
                lastName: userProfile.lastName || '',
                bio: userProfile.bio || '',
                graduationYear: userProfile.graduationYear || '',
                branch: userProfile.branch || '',
                githubUrl: userProfile.githubUrl || '',
                linkedinUrl: userProfile.linkedinUrl || '',
                portfolioUrl: userProfile.portfolioUrl || '',
                availabilityStatus: userProfile.availabilityStatus || 'AVAILABLE',
                location: userProfile.college?.location || '',
                collegeName: userProfile.college?.name || ''
            });
        }
    }, [userProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/students/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Update failed');

            toast.success('Profile Synced Successfully');
            setIsEditing(false);
            if (fetchUserProfile) await fetchUserProfile();
        } catch (err) {
            toast.error('Failed to update logic core');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const data = new FormData();
            data.append('file', file);
            const res = await fetch(`${API_BASE_URL}/students/profile-photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: data
            });
            if (res.ok) {
                toast.success('Visual Identity Updated');
                if (fetchUserProfile) await fetchUserProfile();
            }
        } catch (err) {
            toast.error('Photo upload failed');
        }
    };

    const availabilityColors = {
        AVAILABLE: 'bg-emerald-500',
        BUSY: 'bg-amber-500',
        OFFLINE: 'bg-slate-400'
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
            {/* STICKY HEADER */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Identity Profile</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logic Core / User Data</p>
                    </div>
                    <Button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={loading}
                        className={`rounded-xl px-6 h-11 font-bold transition-all ${isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
                            } shadow-lg text-white`}
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : isEditing ? <Save className="mr-2" size={18} /> : <Edit3 className="mr-2" size={18} />}
                        {isEditing ? 'Save Registry' : 'Edit Profile'}
                    </Button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 space-y-8">
                        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white">
                            <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600 relative" />
                            <CardContent className="px-8 pb-8">
                                <div className="relative -mt-16 flex flex-col sm:flex-row items-end gap-6 mb-6">
                                    <div className="relative group">
                                        <Avatar className="w-32 h-32 border-4 border-white shadow-xl rounded-[28px]">
                                            <AvatarImage src={userProfile?.profilePictureUrl} className="object-cover" />
                                            <AvatarFallback className="bg-slate-100 text-indigo-600 text-3xl font-black">
                                                {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        {isEditing && (
                                            <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-[28px] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera size={24} />
                                            </button>
                                        )}
                                        <input ref={fileInputRef} type="file" className="hidden" onChange={handlePhotoUpload} />
                                    </div>
                                    <div className="flex-1 pb-2 text-center sm:text-left">
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                                            {userProfile?.firstName} {userProfile?.lastName}
                                        </h3>
                                        <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                                            <Badge className={`${availabilityColors[formData.availabilityStatus]} text-white border-none font-bold text-[10px] px-3 py-1 rounded-full`}>
                                                {formData.availabilityStatus}
                                            </Badge>
                                            <span className="text-slate-400 font-bold text-xs uppercase tracking-tighter flex items-center gap-1">
                                                <Briefcase size={14} className="text-indigo-500" /> {userProfile?.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block">Executive Summary</Label>
                                    {isEditing ? (
                                        <Textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            className="min-h-[120px] rounded-2xl border-slate-200 text-base"
                                            placeholder="Write your professional bio..."
                                        />
                                    ) : (
                                        <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                            {formData.bio || "No biography provided."}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="rounded-3xl border-slate-200/60">
                                <CardHeader><CardTitle className="text-sm font-black uppercase text-slate-400">Core Details</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-500">First Name</Label>
                                        <Input name="firstName" disabled={!isEditing} value={formData.firstName} onChange={handleInputChange} className="rounded-xl bg-slate-50/50 border-none font-semibold h-11" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-500">Last Name</Label>
                                        <Input name="lastName" disabled={!isEditing} value={formData.lastName} onChange={handleInputChange} className="rounded-xl bg-slate-50/50 border-none font-semibold h-11" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-slate-200/60">
                                <CardHeader><CardTitle className="text-sm font-black uppercase text-slate-400">System Status</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-500">Availability</Label>
                                        <select
                                            name="availabilityStatus"
                                            disabled={!isEditing}
                                            value={formData.availabilityStatus}
                                            onChange={handleInputChange}
                                            className="w-full h-11 bg-slate-50/50 rounded-xl px-4 font-bold text-sm text-slate-700 border-none"
                                        >
                                            <option value="AVAILABLE">Available</option>
                                            <option value="BUSY">Busy</option>
                                            <option value="OFFLINE">Offline</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-2xl">
                                        <Mail className="text-indigo-600" size={20} />
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase">Network Email</p>
                                            <p className="text-sm font-bold text-slate-700 truncate">{userProfile?.email}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-4 space-y-8">
                        <Card className="rounded-[32px] border-slate-200/60 shadow-xl shadow-slate-200/40">
                            <CardHeader>
                                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <GraduationCap size={16} className="text-indigo-600" /> Academic Base
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <Building2 className="text-slate-400 mt-1" size={20} />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">University</p>
                                            <p className="text-sm font-black text-slate-800">{userProfile?.college?.name}</p>
                                            <p className="text-xs font-bold text-indigo-500 flex items-center gap-1 mt-1"><MapPin size={10} /> {userProfile?.college?.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <LayoutGrid className="text-slate-400 mt-1" size={20} />
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Branch</p>
                                            {isEditing ? (
                                                <Input name="branch" value={formData.branch} onChange={handleInputChange} className="h-9 bg-slate-50 border-none font-bold text-xs" />
                                            ) : (
                                                <p className="text-sm font-black text-slate-800">{formData.branch}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Calendar className="text-slate-400 mt-1" size={20} />
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Graduation</p>
                                            {isEditing ? (
                                                <Input name="graduationYear" type="number" value={formData.graduationYear} onChange={handleInputChange} className="h-9 bg-slate-50 border-none font-bold text-xs" />
                                            ) : (
                                                <p className="text-sm font-black text-slate-800">Class of {formData.graduationYear}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[32px] border-none bg-slate-900 text-white overflow-hidden shadow-2xl">
                            <CardHeader>
                                <CardTitle className="text-xs font-black uppercase text-indigo-400">Professional Links</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="group">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Github size={16} className="text-indigo-400" />
                                            <Label className="text-[10px] font-black uppercase text-slate-500">GitHub Registry</Label>
                                        </div>
                                        {isEditing ? (
                                            <Input name="githubUrl" value={formData.githubUrl} onChange={handleInputChange} className="h-9 bg-white/5 border-none text-white text-xs" />
                                        ) : (
                                            <a href={formData.githubUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-200 hover:text-white flex items-center justify-between group">
                                                {formData.githubUrl ? "Launch Repository" : "No Link"} <LinkIcon size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="group">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Linkedin size={16} className="text-indigo-400" />
                                            <Label className="text-[10px] font-black uppercase text-slate-500">LinkedIn Connect</Label>
                                        </div>
                                        {isEditing ? (
                                            <Input name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} className="h-9 bg-white/5 border-none text-white text-xs" />
                                        ) : (
                                            <a href={formData.linkedinUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-200 hover:text-white flex items-center justify-between group">
                                                {formData.linkedinUrl ? "Sync LinkedIn" : "No Link"} <LinkIcon size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="group">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Globe size={16} className="text-indigo-400" />
                                            <Label className="text-[10px] font-black uppercase text-slate-500">Portfolio Domain</Label>
                                        </div>
                                        {isEditing ? (
                                            <Input name="portfolioUrl" value={formData.portfolioUrl} onChange={handleInputChange} className="h-9 bg-white/5 border-none text-white text-xs" />
                                        ) : (
                                            <a href={formData.portfolioUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-200 hover:text-white flex items-center justify-between group">
                                                {formData.portfolioUrl ? "Visit Domain" : "No Link"} <LinkIcon size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}