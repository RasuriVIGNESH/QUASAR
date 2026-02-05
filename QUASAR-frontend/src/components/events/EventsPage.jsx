import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dataService from '../../services/dataService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, Clock, History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EventsPage() {
    const [allEvents, setAllEvents] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const [allRes, recentRes] = await Promise.all([
                    dataService.getAllEvents(),
                    dataService.getRecentEvents()
                ]);

                // Handle response formats
                setAllEvents(Array.isArray(allRes) ? allRes : allRes.data || []);
                setRecentEvents(Array.isArray(recentRes) ? recentRes : recentRes.data || []);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const EventCard = ({ event }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            onClick={() => navigate(`/events/${event.id}`)}
            className="cursor-pointer h-full"
        >
            <Card className="h-full hover:shadow-xl transition-all duration-300 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800 overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-blue-600 to-slate-600" />
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <Badge variant="outline" className={`
              ${event.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                event.status === 'ONGOING' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}
            `}>
                            {event.status || 'Event'}
                        </Badge>
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {event.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                        {event.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900/30">
            <div className="container mx-auto px-4 py-8 pt-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center max-w-2xl mx-auto"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                        Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-600">Events</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Join workshops, hackathons, and meetups to learn, connect, and grow.
                    </p>
                </motion.div>

                <Tabs defaultValue="all" className="w-full max-w-6xl mx-auto">
                    <div className="flex justify-center mb-8">
                        <TabsList className="p-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                            <TabsTrigger value="all" className="rounded-xl px-8 py-2.5 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                                All Events
                            </TabsTrigger>
                            <TabsTrigger value="recent" className="rounded-xl px-8 py-2.5 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                                Recently Added
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="all" className="mt-0">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-72 rounded-3xl" />)}
                            </div>
                        ) : allEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {allEvents.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
                                <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No events found</h3>
                                <p className="text-slate-500 dark:text-slate-400">Check back later for new opportunities.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="recent" className="mt-0">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-72 rounded-3xl" />)}
                            </div>
                        ) : recentEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recentEvents.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
                                <History className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No recent events</h3>
                                <p className="text-slate-500 dark:text-slate-400">Check all events to see everything available.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
