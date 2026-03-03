import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Calendar, FileText, Users, User, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dataService from '../../services/dataService';
import { toast } from 'sonner';

export default function AdminEventDetails() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    
    const [event, setEvent] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                setLoading(true);
                const [eventRes, projectsRes] = await Promise.all([
                    dataService.getEventById(eventId),
                    dataService.getEventProjects(eventId)
                ]);
                setEvent(eventRes.data || eventRes);
                setProjects(projectsRes || []);
            } catch (error) {
                console.error('Failed to fetch event details', error);
                toast.error('Failed to load event details');
            } finally {
                setLoading(false);
            }
        };
        fetchEventData();
    }, [eventId]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <p className="text-xl font-semibold text-slate-700">Event not found</p>
                <Button onClick={() => navigate('/admin/events')} variant="outline">Back to Events</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/admin/events')}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{event.name}</h1>
                    <div className="flex items-center gap-2 mt-1 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                        <Badge variant="outline" className={`ml-2
                            ${event.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              event.status === 'ONGOING' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}
                        `}>
                            {event.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
                <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                        <p className="text-slate-700 dark:text-slate-300">
                            {event.description}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Registered Projects ({projects.length})
                    </h2>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center p-12 border border-dashed rounded-lg text-slate-500 dark:border-slate-800">
                        No projects registered for this event yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <Card 
                                key={project.id} 
                                className="cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all group h-full flex flex-col"
                                onClick={() => navigate(`/projects/${project.id}`)}
                            >
                                <CardHeader className="pb-3 flex-none border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-start gap-4">
                                        <CardTitle className="text-lg leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                                            {project.title}
                                        </CardTitle>
                                        <Badge variant={project.status === 'COMPLETED' ? 'default' : 'secondary'} className="shrink-0">
                                            {project.status || 'Active'}
                                        </Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2 mt-2">
                                        {project.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col pt-4">
                                    <div className="space-y-4 text-sm flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 flex items-center gap-1"><User className="w-4 h-4"/> Lead</span>
                                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                                {project.Lead?.firstName} {project.Lead?.lastName}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 flex items-center gap-1"><Users className="w-4 h-4"/> Students (Size)</span>
                                            <span className="font-medium text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
                                                {project.currentTeamSize || 1} / {project.maxTeamSize}
                                            </span>
                                        </div>
                                        <div className="pt-2">
                                            <span className="text-slate-500 flex items-center gap-1 mb-1.5"><Info className="w-4 h-4"/> Team Members</span>
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-md border border-slate-100 dark:border-slate-800">
                                                <p className="font-medium text-slate-700 dark:text-slate-300">
                                                    {project.members && project.members.length > 0 
                                                        ? project.members.map(m => m.user.firstName + ' ' + m.user.lastName).join(', ') 
                                                        : <span className="text-slate-400 italic">Lead only, currently looking for members</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
