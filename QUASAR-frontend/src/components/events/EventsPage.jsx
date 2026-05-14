import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import dataService from '../../services/dataService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, History, ArrowRight, MapPin, Search, PlusCircle, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

export default function EventsPage() {
    const [allEvents, setAllEvents] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                // Endpoints: /api/events/all and /api/events/recent
                const [allRes, recentRes] = await Promise.all([
                    dataService.getAllEvents(),
                    dataService.getRecentEvents()
                ]);

                const allData = Array.isArray(allRes) ? allRes : allRes.data || [];
                const recentData = Array.isArray(recentRes) ? recentRes : recentRes.data || [];

                setAllEvents(allData);
                setRecentEvents(recentData);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Helper: Filter events based on search query
    const filterData = (data) => {
        return data.filter(event =>
            event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const filteredAll = useMemo(() => filterData(allEvents), [allEvents, searchQuery]);
    const filteredRecent = useMemo(() => filterData(recentEvents), [recentEvents, searchQuery]);

    const EventCard = ({ event }) => {
        // Check if event was created recently (within last 3 days)
        const isNew = new Date() - new Date(event.createdAt) < 3 * 24 * 60 * 60 * 1000;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/events/${event.id}`)}
                className="cursor-pointer h-full"
            >
                <Card className="h-full border-slate-200 bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden group rounded-[24px]">
                    <div className="h-2 bg-slate-50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-600 w-0 group-hover:w-full transition-all duration-700 ease-in-out" />
                    </div>

                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-5">
                            <div className="flex gap-2">
                                <Badge className={`
                                    ${event.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600' :
                                        event.status === 'ONGOING' ? 'bg-emerald-50 text-emerald-600' :
                                            'bg-slate-100 text-slate-600'} border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1
                                `}>
                                    {event.status || 'Event'}
                                </Badge>
                                {isNew && (
                                    <Badge className="bg-amber-50 text-amber-600 border-none font-bold text-[10px] uppercase px-3 py-1 flex gap-1 items-center">
                                        <Sparkles size={10} /> New
                                    </Badge>
                                )}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                <ArrowRight size={18} />
                            </div>
                        </div>

                        <h3 className="text-2xl font-extrabold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                            {event.name}
                        </h3>

                        <p className="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed font-medium">
                            {event.description}
                        </p>

                        <div className="space-y-3 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Calendar size={14} />
                                </div>
                                <span>
                                    {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    {event.endDate && event.endDate !== event.startDate && ` — ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <MapPin size={14} />
                                </div>
                                <span>Campus Innovation Hub</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            {/* HERO HEADER */}
            <div className="bg-white border-b border-slate-200 pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Badge className="bg-indigo-50 text-indigo-600 border-none mb-6 uppercase tracking-[0.2em] px-6 py-1.5 font-black text-[11px]">
                            Logic Hub Events
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter">
                            Connect <span className="text-indigo-600">&</span> Create.
                        </h1>
                        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                            Join student-led initiatives, technical workshops, and high-impact hackathons across campus.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">
                <Tabs defaultValue="all" className="w-full">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-12">
                        <TabsList className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm h-14">
                            <TabsTrigger value="all" className="rounded-xl px-10 py-3 text-sm font-black uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                                All Events
                            </TabsTrigger>
                            <TabsTrigger value="recent" className="rounded-xl px-10 py-3 text-sm font-black uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                                Recently Added
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            <Input
                                className="h-14 pl-12 pr-6 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                placeholder="Search event registry..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <TabsContent value="all" className="outline-none">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[400px] rounded-[32px]" />)}
                            </div>
                        ) : filteredAll.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredAll.map(event => <EventCard key={event.id} event={event} />)}
                            </div>
                        ) : (
                            <EmptyState message="No events found matching your search." />
                        )}
                    </TabsContent>

                    <TabsContent value="recent" className="outline-none">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-[400px] rounded-[32px]" />)}
                            </div>
                        ) : filteredRecent.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredRecent.map(event => <EventCard key={event.id} event={event} />)}
                            </div>
                        ) : (
                            <EmptyState message="No recent events found." />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Registry Silent</h3>
            <p className="text-slate-400 font-medium">{message}</p>
        </div>
    );
}