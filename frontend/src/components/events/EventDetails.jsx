import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dataService from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

// Icons
import {
    Calendar, Clock, Users, ArrowLeft, Share2,
    CheckCircle, MapPin, Loader2, Info, LayoutGrid,
    CalendarCheck, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function EventDetails() {
    const { id } = useParams(); // Note: Changed to 'id' to match your App.jsx route /events/:id
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [projects, setProjects] = useState([]);
    const [isRegistered, setIsRegistered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        const fetchAllDetails = async () => {
            try {
                setLoading(true);
                if (!id) return;

                // Promise.all to fetch everything in parallel
                const [eventRes, usersRes, projectsRes] = await Promise.all([
                    dataService.getEventById(id),
                    dataService.getEventUsers(id),
                    dataService.getEventProjects(id)
                ]);

                setEvent(eventRes.data || eventRes);
                setAttendees(Array.isArray(usersRes) ? usersRes : usersRes.data || []);
                setProjects(Array.isArray(projectsRes) ? projectsRes : projectsRes.data || []);

                if (userProfile?.id) {
                    const exists = await dataService.checkEventUserExists(id, userProfile.id);
                    setIsRegistered(exists);
                }
            } catch (error) {
                console.error('Core sync failed:', error);
                toast.error('Failed to load event protocols');
            } finally {
                setLoading(false);
            }
        };

        fetchAllDetails();
    }, [id, userProfile]);

    const handleRegister = async () => {
        try {
            setRegistering(true);
            await dataService.registerForEvent(id);
            setIsRegistered(true);
            toast.success('Successfully Registered');
            // Refresh attendee list
            const usersRes = await dataService.getEventUsers(id);
            setAttendees(Array.isArray(usersRes) ? usersRes : usersRes.data || []);
        } catch (error) {
            toast.error('Registration failed');
        } finally {
            setRegistering(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        });
    };

    // SAFETY CHECK 1: If still loading, show skeleton
    if (loading) return <DetailSkeleton />;

    // SAFETY CHECK 2: If loading is finished but event is still null (e.g. 404), show error
    if (!event) {
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
                {/* <div className="flex items-center gap-2">
                    <img src="/Logo.png" alt="Quasar" className="w-8 h-8" />
                    <span className="font-bold text-indigo-600 tracking-tight">Quasar Hub</span>
                </div> */}
                <Button variant="outline" size="icon" className="rounded-full"><Share2 size={16} /></Button>
            </header>

            {/* HERO HEADER */}
            <div className="pt-16 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-3 mb-6">
                            {/* FIXED: Optional Chaining event?.status */}
                            <Badge className={`px-3 py-1 font-bold uppercase tracking-wider text-[10px] border-none ${event?.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                {event?.status}
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
                                    <p className="text-sm font-bold">Campus Hub</p>
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
                                {event?.description}
                            </p>
                        </section>

                        <section className="space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <LayoutGrid size={18} className="text-indigo-600" /> Event Projects
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.map(proj => (
                                    <Card key={proj.id} className="border-slate-200 hover:border-indigo-300 transition-all cursor-pointer">
                                        <CardContent className="p-5">
                                            <h4 className="font-bold text-slate-900 mb-2 truncate">{proj.title}</h4>
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