import React, { useState, useEffect, useRef } from 'react';
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
    Camera, Save, Edit3, Loader2,
    MapPin, Briefcase, Link as LinkIcon, Building2, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

// Use service layer — no direct fetch
import userService from '../../services/userService';

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
            await userService.updateUserProfile(formData);
            toast.success('Profile updated successfully');
            setIsEditing(false);
            if (fetchUserProfile) await fetchUserProfile();
        } catch (err) {
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await userService.uploadProfilePicture(file);
            toast.success('Profile photo updated');
            if (fetchUserProfile) await fetchUserProfile();
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
        <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
            {/* STICKY HEADER - Professional Minimalist */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">My Profile</h2>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Account Settings</p>
                    </div>
                    <Button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={loading}
                        className={`rounded-lg px-5 h-10 font-bold text-sm transition-all ${isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : isEditing ? <Save className="mr-2" size={16} /> : <Edit3 className="mr-2" size={16} />}
                        {isEditing ? 'Save' : 'Edit'}
                    </Button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN - Profile Card */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* PROFILE HERO CARD */}
                        <Card className="border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                            <div className="h-24 bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-100" />
                            <CardContent className="px-6 pb-6">
                                <div className="relative -mt-12 flex flex-col sm:flex-row items-end gap-4 mb-6">
                                    <div className="relative group">
                                        <Avatar className="w-24 h-24 border-4 border-white shadow-md rounded-lg">
                                            <AvatarImage src={userProfile?.profilePictureUrl} className="object-cover" />
                                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl font-bold">
                                                {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        {isEditing && (
                                            <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera size={20} />
                                            </button>
                                        )}
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                    </div>
                                    <div className="flex-1 pb-1">
                                        <h3 className="text-2xl font-bold text-slate-900">
                                            {userProfile?.firstName} {userProfile?.lastName}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge className={`${availabilityColors[formData.availabilityStatus]} text-white border-none font-bold text-[9px] px-2 py-0`}>
                                                {formData.availabilityStatus}
                                            </Badge>
                                            <span className="text-slate-400 font-semibold text-xs flex items-center gap-1">
                                                <Briefcase size={12} /> {userProfile?.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Bio</Label>
                                    {isEditing ? (
                                        <Textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            className="min-h-[100px] rounded-lg border-slate-200 text-sm text-slate-900"
                                            placeholder="Write your professional bio..."
                                        />
                                    ) : (
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            {formData.bio || "No biography provided."}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* DETAILS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                                <CardHeader className="pb-3"><CardTitle className="text-xs font-bold uppercase text-slate-400">Personal Details</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-500">First Name</Label>
                                        <Input name="firstName" disabled={!isEditing} value={formData.firstName} onChange={handleInputChange} className="rounded-lg bg-slate-50 border-slate-200 h-9 text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-500">Last Name</Label>
                                        <Input name="lastName" disabled={!isEditing} value={formData.lastName} onChange={handleInputChange} className="rounded-lg bg-slate-50 border-slate-200 h-9 text-sm" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                                <CardHeader className="pb-3"><CardTitle className="text-xs font-bold uppercase text-slate-400">Status</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-500">Availability</Label>
                                        <select
                                            name="availabilityStatus"
                                            disabled={!isEditing}
                                            value={formData.availabilityStatus}
                                            onChange={handleInputChange}
                                            className="w-full h-9 bg-slate-50 rounded-lg px-3 font-semibold text-xs text-slate-700 border border-slate-200"
                                        >
                                            <option value="AVAILABLE">Available</option>
                                            <option value="BUSY">Busy</option>
                                            <option value="OFFLINE">Offline</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                                        <Mail className="text-indigo-600" size={16} />
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-bold text-indigo-400 uppercase">Email</p>
                                            <p className="text-xs font-semibold text-slate-700 truncate">{userProfile?.email}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Academic & Links */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* ACADEMIC INFO */}
                        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                                    <GraduationCap size={14} className="text-indigo-600" /> Academic
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Building2 className="text-slate-400 mt-0.5" size={16} />
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">University</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{userProfile?.college?.name}</p>
                                        <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-1"><MapPin size={10} /> {userProfile?.college?.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Briefcase className="text-slate-400 mt-0.5" size={16} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Branch</p>
                                        {isEditing ? (
                                            <Input name="branch" value={formData.branch} onChange={handleInputChange} className="h-8 bg-slate-50 border-slate-200 text-xs rounded-lg" />
                                        ) : (
                                            <p className="text-sm font-bold text-slate-800">{formData.branch || '—'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="text-slate-400 mt-0.5" size={16} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Graduation</p>
                                        {isEditing ? (
                                            <Input name="graduationYear" type="number" value={formData.graduationYear} onChange={handleInputChange} className="h-8 bg-slate-50 border-slate-200 text-xs rounded-lg" />
                                        ) : (
                                            <p className="text-sm font-bold text-slate-800">Class of {formData.graduationYear || '—'}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* PROFESSIONAL LINKS */}
                        <Card className="rounded-lg border-slate-200 bg-white shadow-sm overflow-hidden">
                            <CardHeader className="pb-3 bg-slate-50 border-b border-slate-100">
                                <CardTitle className="text-xs font-bold uppercase text-slate-400">Professional Links</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {[
                                    { key: 'githubUrl', icon: Github, label: 'GitHub', placeholder: 'https://github.com/...' },
                                    { key: 'linkedinUrl', icon: Linkedin, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
                                    { key: 'portfolioUrl', icon: Globe, label: 'Portfolio', placeholder: 'https://yoursite.com' },
                                ].map(({ key, icon: Icon, label, placeholder }) => (
                                    <div key={key} className="group">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Icon size={14} className="text-indigo-600" />
                                            <Label className="text-[9px] font-bold uppercase text-slate-400">{label}</Label>
                                        </div>
                                        {isEditing ? (
                                            <Input
                                                name={key}
                                                value={formData[key]}
                                                onChange={handleInputChange}
                                                placeholder={placeholder}
                                                className="h-8 bg-slate-50 border-slate-200 text-xs rounded-lg"
                                            />
                                        ) : (
                                            <a href={formData[key]} target="_blank" rel="noreferrer" className={`text-xs font-semibold flex items-center justify-between group transition-colors ${formData[key] ? 'text-indigo-600 hover:text-indigo-700' : 'text-slate-400 pointer-events-none'}`}>
                                                {formData[key] ? `Visit ${label}` : 'Not set'}
                                                {formData[key] && <LinkIcon size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
