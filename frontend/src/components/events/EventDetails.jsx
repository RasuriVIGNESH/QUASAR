import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import useFetch from '@/hooks/useFetch';
import dataService from '@/services/dataService';
import { toast } from 'sonner';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Icons
import {
    Calendar, Clock, Users, ArrowLeft, Share2,
    CheckCircle, MapPin, Loader2, Info, LayoutGrid,
    CalendarCheck, AlertCircle
} from 'lucide-react';

/**
 * EventDetails Component
 * 
 * Optimized with:
 * - SWR pattern for instant loading
 * - Improved data linkage (attendees, projects, dates)
 * - Parallel fetching of event, attendees, and projects
 */
export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    const [registering, setRegistering] = useState(false);

    // Fetch event details with SWR
    const { data: event, loading: eventLoading, refetch: refetchEvent, isValidating: eventValidating } = useFetch(
        `/events/${id}`,
        {},
        { cacheTTL: 30000, revalidateOnFocus: true }
    );

    // Fetch event attendees with SWR
    const { data: attendeesData, loading: attendeesLoading, refetch: refetchAttendees } = useFetch(
        `/events/${id}/students`,
        {},
        { cacheTTL: 30000 }
    );

    const attendees = useMemo(() => {
        const data = attendeesData?.data || attendeesData || [];
        return Array.isArray(data) ? data : [];
    }, [attendeesData]);

    // Fetch event projects with SWR
    const { data: projectsData, loading: projectsLoading } = useFetch(
        `/events/${id}/projects`,
        {},
        { cacheTTL: 30000 }
    );

    const projects = useMemo(() => {
        const data = projectsData?.data || projectsData || [];
        return Array.isArray(data) ? data : [];
    }, [projectsData]);

    // Check if user is registered
    const { data: registrationData, refetch: refetchRegistration } = useFetch(
        userProfile?.id ? `/events/${id}/students/${userProfile.id}/exists` : null,
        {},
        { skip: !userProfile?.id, cacheTTL: 30000 }
    );

    const isRegistered = useMemo(() => !!registrationData, [registrationData]);

    const handleRegister = useCallback(async () => {
        try {
            setRegistering(true);
            await dataService.registerForEvent(id);
            toast.success('Successfully Registered');
            refetchRegistration();
            refetchAttendees();
        } catch (error) {
            toast.error('Registration failed');
        } finally {
            setRegistering(false);
        }
    }, [id, refetchRegistration, refetchAttendees]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        });
    };

    const loading = eventLoading || attendeesLoading || projectsLoading;

    if (loading && !event) return <DetailSkeleton />;

    if (!event && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="p-8 text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold">Event Not Found</h2>
                    <p className="text-slate-500 mb-6">The requested event protocol does not exist.</p>
                    <Button onClick={() => navigate('/events')}>Return to Events</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
            {/* TOP NAVIGATION */}
            <header className="fixed top-0 z-50 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="font-bold gap-2">
                    <ArrowLeft size={18} /> Back
                </Button>
                <div className="flex items-center gap-2">
                    {eventValidating && <Loader2 size={16} className="animate-spin text-indigo-600" />}
                </div>
                <Button variant="outline" size="icon" className="rounded-full"><Share2 size={16} /></Button>
            </header>

            {/* HERO HEADER */}
            <div className="pt-16 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-3 mb-6">
                            <Badge className={`px-3 py-1 font-bold uppercase tracking-wider text-[10px] border-none ${event?.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                {event?.status || 'UPCOMING'}
                            </Badge>
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-tighter flex items-center gap-2">
                                <CalendarCheck size={14} className="text-indigo-600" />
                                {attendees.length} Members Joined
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-8">
                            {event?.name}
                        </h1>
                        <div className="flex flex-wrap gap-y-4 gap-x-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><Calendar size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Dates</p>
                                    <p className="text-sm font-bold">{formatDate(event?.startDate)} — {formatDate(event?.endDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><MapPin size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                    <p className="text-sm font-bold">{event?.location || 'Campus Hub'}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-12 gap-8 lg:gap-16">
                    <div className="col-span-12 lg:col-span-8 space-y-16">
                        <section className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">About the Event</h3>
                            <p className="text-xl text-slate-600 leading-relaxed font-medium">
                                {event?.description || 'No description provided for this event.'}
                            </p>
                        </section>

                        <section className="space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <LayoutGrid size={18} className="text-indigo-600" /> Event Projects
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.map(proj => (
                                    <Card key={proj.id} onClick={() => navigate(`/projects/${proj.id}`)} className="border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group">
                                        <CardContent className="p-5">
                                            <h4 className="font-bold text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">{proj.title}</h4>
                                            <p className="text-xs text-slate-500 line-clamp-2">{proj.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                                {projects.length === 0 && (
                                    <p className="text-sm text-slate-400 italic">No projects registered yet.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="col-span-12 lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            <Card className="border-slate-200 shadow-xl shadow-indigo-500/5 rounded-[32px]">
                                <CardContent className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration Deadlines</p>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Opens</span>
                                            <span className="font-bold">{formatDate(event?.startRegisterDate)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Closes</span>
                                            <span className="font-bold text-rose-600">{formatDate(event?.endRegistrationDate)}</span>
                                        </div>
                                    </div>

                                    {isRegistered ? (
                                        <div className="w-full h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center gap-2 font-bold border border-emerald-100">
                                            <CheckCircle size={20} /> Registered
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleRegister}
                                            disabled={registering}
                                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-base shadow-lg"
                                        >
                                            {registering ? <Loader2 size={20} className="animate-spin" /> : 'Register Now'}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Attendees List Preview */}
                            {attendees.length > 0 && (
                                <Card className="border-slate-200 rounded-[32px]">
                                    <CardContent className="p-6">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Joined Members</h4>
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {attendees.slice(0, 8).map((attendee, i) => (
                                                <Avatar key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white">
                                                    <AvatarImage src={attendee.profilePictureUrl} />
                                                    <AvatarFallback className="bg-indigo-100 text-indigo-600 text-[10px] font-bold">{attendee.firstName?.[0]}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {attendees.length > 8 && (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-[10px] font-bold text-slate-500">
                                                    +{attendees.length - 8}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

function DetailSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 p-8 pt-24 space-y-8 max-w-7xl mx-auto">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-48 w-full rounded-3xl" />
            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-4">
                    <Skeleton className="h-64 w-full rounded-3xl" />
                </div>
                <div className="col-span-4">
                    <Skeleton className="h-96 w-full rounded-3xl" />
                </div>
            </div>
        </div>
    );
}
