import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dataService from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Calendar, Clock, Users, ChevronLeft, Share2,
    Github, Linkedin, Globe, CheckCircle, Trophy
} from 'lucide-react';
import { toast } from 'sonner';

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

                // Parallel fetch for efficiency
                const [eventRes, usersRes, countRes] = await Promise.all([
                    dataService.getEventById(eventId),
                    dataService.getEventUsers(eventId),
                    dataService.getEventUserCount(eventId)
                ]);

                setEvent(eventRes.data || eventRes);
                setAttendees(Array.isArray(usersRes) ? usersRes : usersRes.data || []);
                setAttendeeCount(typeof countRes === 'object' ? countRes.data : countRes);

                // Check user status if logged in
                if (userProfile?.id) {
                    const existsRes = await dataService.checkEventUserExists(eventId, userProfile.id);
                    setUserStatus({ exists: existsRes });
                }

            } catch (error) {
                console.error('Failed to fetch event details:', error);
                toast.error('Failed to load event details');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId, userProfile]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 pt-24 min-h-screen">
                <Skeleton className="h-8 w-24 mb-6" />
                <Skeleton className="h-64 w-full rounded-3xl mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-40 w-full rounded-2xl" />
                        <Skeleton className="h-40 w-full rounded-2xl" />
                    </div>
                    <div>
                        <Skeleton className="h-96 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
                    <Button onClick={() => navigate('/events')}>Back to Events</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50">
            {/* Hero Section */}
            <div className="relative h-[400px] w-full overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br from-blue-700 to-slate-800`}>
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                </div>

                <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                                {event.status || 'Event'}
                            </Badge>
                            <span className="text-blue-100 flex items-center gap-1 text-sm bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(event.startDate).toLocaleDateString()}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 max-w-4xl leading-tight">
                            {event.name}
                        </h1>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 -mt-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="border-0 shadow-xl overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="prose dark:prose-invert max-w-none">
                                        <h3 className="text-2xl font-bold mb-4">About this Event</h3>
                                        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {event.description}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">Start Date</p>
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                {new Date(event.startDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">End Date</p>
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                {new Date(event.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">Attendees</p>
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                {attendeeCount || 0}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Attendees Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-bold">Attendees ({attendees.length})</h3>
                                        {userStatus.exists && (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                You are attending
                                            </Badge>
                                        )}
                                    </div>

                                    {attendees.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {attendees.map((attendee) => (
                                                <motion.div
                                                    key={attendee.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
                                                >
                                                    <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-sm">
                                                        <AvatarImage src={attendee.profilePictureUrl || attendee.profilePhoto?.[0]} />
                                                        <AvatarFallback className="bg-blue-100 text-blue-700">
                                                            {attendee.firstName?.[0]}{attendee.lastName?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">
                                                            {attendee.firstName} {attendee.lastName}
                                                        </h4>
                                                        <p className="text-sm text-slate-500 truncate">{attendee.bio || attendee.branch}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {attendee.githubUrl && (
                                                            <a href={attendee.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                                                <Github className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        {attendee.linkedinUrl && (
                                                            <a href={attendee.linkedinUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600">
                                                                <Linkedin className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900/30 rounded-2xl">
                                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>Be the first to join!</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-lg mb-4">Event Status</h3>
                                    <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                                        <Clock className="w-5 h-5 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold">{event.status || 'Scheduled'}</p>
                                            <p className="text-xs opacity-80">Check dates for details</p>
                                        </div>
                                    </div>

                                    <Button className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                                        {userStatus.exists ? 'Registered' : 'Register Now'}
                                    </Button>

                                    <p className="text-xs text-center mt-3 text-slate-400">
                                        Limited spots available
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
