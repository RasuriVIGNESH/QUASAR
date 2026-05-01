import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import dataService from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Icons
import {
    Calendar, Clock, Users, ChevronLeft, Share2,
    Github, Linkedin, Globe, CheckCircle, Trophy,
    Zap, MapPin, ArrowRight, ArrowLeft, Target
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── DESIGN TOKENS ──────────────────────────────────────────────────────── */
const THEME = {
    bg: '#020617',
    surface: '#0B1120',
    indigo: '#818CF8',
    cyan: '#22D3EE'
};

export default function EventDetailPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [userStatus, setUserStatus] = useState({ exists: false });
    const [attendeeCount, setAttendeeCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                setLoading(true);
                if (!eventId) return;

                const [eventRes, usersRes, countRes] = await Promise.all([
                    dataService.getEventById(eventId),
                    dataService.getEventUsers(eventId),
                    dataService.getEventUserCount(eventId)
                ]);

                setEvent(eventRes.data || eventRes);
                setAttendees(Array.isArray(usersRes) ? usersRes : usersRes.data || []);
                setAttendeeCount(typeof countRes === 'object' ? countRes.data : countRes);

                if (userProfile?.id) {
                    const existsRes = await dataService.checkEventUserExists(eventId, userProfile.id);
                    setUserStatus({ exists: existsRes });
                }
            } catch (error) {
                console.error('Fetch error:', error);
                toast.error('Logic core sync failed');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId, userProfile]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] p-8 space-y-8 pt-28">
                <Skeleton className="h-12 w-64 bg-white/5 rounded-xl" />
                <Skeleton className="h-[400px] w-full bg-white/5 rounded-[40px]" />
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-8 space-y-6">
                        <Skeleton className="h-64 bg-white/5 rounded-3xl" />
                    </div>
                    <div className="col-span-12 lg:col-span-4">
                        <Skeleton className="h-96 bg-white/5 rounded-3xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-slate-200" style={{ backgroundColor: THEME.bg, fontFamily: '"Outfit", sans-serif' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,500;1,600&family=Outfit:wght@300;400;500;700;900&display=swap');
                .hero-mesh { 
                    background: radial-gradient(at 0% 0%, rgba(129, 140, 248, 0.15) 0, transparent 50%), 
                                radial-gradient(at 100% 100%, rgba(34, 211, 238, 0.1) 0, transparent 50%);
                }
                .glass-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(10px); }
            `}</style>

            {/* ── HEADER ── */}
            <header className="fixed top-0 z-50 w-full h-20 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="hover:text-amber-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/Logo.png" alt="Quasar" className="w-10 h-10 rounded-xl" loading="lazy" />
                        <h1 className="font-serif italic text-xl text-white">Quasar</h1>
                    </div>
                </div>
                <button className="p-2.5 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all">
                    <Share2 size={16} />
                </button>
            </header>

            {/* ── HERO SECTION ── */}
            <div className="relative pt-20 h-[450px] w-full hero-mesh overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-16 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-4 mb-6">
                            <Badge className="bg-indigo-500 text-white border-none font-black text-[10px] tracking-widest px-4 py-1.5 uppercase rounded-sm">
                                {event.status || 'Event'}
                            </Badge>
                            <span className="text-cyan-400 font-serif italic text-lg flex items-center gap-2">
                                <Calendar size={18} /> {new Date(event.startDate).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif italic text-white max-w-5xl leading-tight mb-4">
                            {event.name}
                        </h1>
                    </motion.div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-12 gap-8 lg:gap-12">

                    {/* ── LEFT COLUMN ── */}
                    <div className="col-span-12 lg:col-span-8 space-y-10">

                        {/* Description */}
                        <section className="bg-[#0b1120]/50 border border-white/5 p-8 md:p-12 rounded-[40px] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Target size={120} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8">Executive Summary</h3>
                            <p className="font-serif italic text-2xl md:text-3xl text-slate-300 leading-relaxed">
                                {event.description}
                            </p>

                            <div className="mt-12 pt-12 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Launch Date</p>
                                    <p className="text-xl text-white">{new Date(event.startDate).toDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Conclusion</p>
                                    <p className="text-xl text-white">{new Date(event.endDate).toDateString()}</p>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Network Load</p>
                                    <p className="text-xl text-cyan-400 font-black">{attendeeCount || 0} Registered</p>
                                </div>
                            </div>
                        </section>

                        {/* Attendees */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Peer Network</h3>
                                {userStatus.exists && (
                                    <span className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                        <CheckCircle size={14} /> Registered in Registry
                                    </span>
                                )}
                            </div>

                            {attendees.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {attendees.map((attendee) => (
                                        <motion.div
                                            key={attendee.id}
                                            whileHover={{ y: -5 }}
                                            className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-500/40 transition-all duration-300"
                                        >
                                            <Avatar className="h-14 w-14 border border-white/10 p-0.5">
                                                <AvatarImage src={attendee.profilePictureUrl || attendee.profilePhoto?.[0]} />
                                                <AvatarFallback className="bg-slate-800 text-indigo-400 font-black text-xs">
                                                    {attendee.firstName?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-bold text-white uppercase tracking-tight truncate leading-none">
                                                    {attendee.firstName} {attendee.lastName}
                                                </h4>
                                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2 flex items-center gap-1">
                                                    <Target size={10} className="text-indigo-500" />
                                                    {attendee.branch || 'General Intel'}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-3 text-white/20">
                                                {attendee.githubUrl && <a href={attendee.githubUrl}><Github size={14} /></a>}
                                                {attendee.linkedinUrl && <a href={attendee.linkedinUrl}><Linkedin size={14} /></a>}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center glass-card rounded-[40px]">
                                    <Users size={32} className="mx-auto mb-4 text-white/5" />
                                    <p className="font-serif italic text-white/20">The peer registry is currently silent.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* ── SIDEBAR ── */}
                    <aside className="col-span-12 lg:col-span-4 space-y-6">
                        <section className="bg-white/[0.03] border border-white/5 p-8 rounded-[40px] sticky top-28">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Status Terminal</h4>

                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#020617] border border-white/5 mb-8">
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-white/40">Current Phase</p>
                                    <p className="font-serif italic text-lg text-white">{event.status || 'Active Integration'}</p>
                                </div>
                            </div>

                            <Button
                                onClick={() => !userStatus.exists && navigate(`/projects/create?eventId=${event.id}&eventName=${encodeURIComponent(event.name)}`)}
                                disabled={userStatus.exists}
                                className="w-full h-16 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl hover:bg-cyan-400 transition-all shadow-2xl shadow-cyan-400/10"
                            >
                                {userStatus.exists ? 'System Integrated' : 'Acquire Logic Entry'}
                            </Button>

                            <div className="mt-8 flex flex-col gap-4">
                                <div className="flex justify-between items-center text-[10px] font-black text-white/20 uppercase tracking-widest">
                                    <span>Registry Capacity</span>
                                    <span>{attendeeCount || 0} / Unlimited</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
                                </div>
                                <p className="text-[10px] text-center text-white/10 font-bold uppercase mt-4">
                                    Registration requires an active project ID
                                </p>
                            </div>
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
}