import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, Plus, Briefcase, Bell, Calendar, MapPin,
  ArrowRight, AlertCircle, Clock, Zap
} from 'lucide-react';
import { toast } from 'sonner';

// Import refactored services
import { projectService } from '@/services/projectService';
import { joinRequestService } from '@/services/JoinRequestService';
import { dataService } from '@/services/dataService';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [myProjects, setMyProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Use service methods instead of manual fetch
        const [projectsRes, invitesRes, requestsRes, eventsRes] = await Promise.all([
          projectService.getMyProjects(0, 6),
          projectService.getReceivedInvitations(),
          joinRequestService.getMyJoinRequests(),
          dataService.getUpcomingEvents()
        ]);

        // Set projects (backend returns paginated object)
        setMyProjects(projectsRes?.data?.content || projectsRes?.content || []);

        // Set invitations (service handles normalization)
        setInvitations(Array.isArray(invitesRes) ? invitesRes : (invitesRes?.data || []));

        // Set requests
        setMyRequests(Array.isArray(requestsRes) ? requestsRes : (requestsRes?.data || []));

        // Set events
        setUpcomingEvents(Array.isArray(eventsRes) ? eventsRes : (eventsRes?.data || []));

      } catch (err) {
        console.error('Dashboard Data Fetch Error:', err);
        setError("Connection refused. Verify your logic core is running.");
        toast.error("Failed to sync dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) fetchDashboardData();
  }, [userProfile]);

  const notificationCount = invitations.length + myRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {userProfile?.firstName}
            </h2>
            <p className="text-slate-500 font-medium mt-1">Logic core status: Operational</p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => navigate('/projects/create')} className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 rounded-xl font-bold">
              <Plus size={18} className="mr-2" /> Create Project
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: PROJECTS & REQUESTS */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="text-indigo-600" size={20} /> My Workspace
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/projects/my-projects')} className="text-indigo-600 font-bold hover:bg-indigo-50">
                View All <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {loading ? (
                [1, 2].map(i => <Skeleton key={i} className="h-44 rounded-2xl" />)
              ) : myProjects.map((p) => (
                <Card key={p.id} className="hover:shadow-xl transition-all border-slate-200 rounded-2xl group cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{p.title}</h4>
                      <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[9px] uppercase">{p.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">{p.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Lead: {p.lead?.firstName}</span>
                      <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                        <Users size={12} /> {p.currentTeamSize}/{p.maxTeamSize}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* QUICK REQUESTS VIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <section className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Invitations</h3>
                <div className="space-y-3">
                  {invitations.slice(0, 2).map(inv => (
                    <div key={inv.invitationId || inv.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <p className="text-xs font-bold truncate pr-2">{inv.project?.title || 'Project Invitation'}</p>
                      <Button size="sm" className="h-7 bg-amber-500 text-[10px]" onClick={() => navigate('/requests')}>Join</Button>
                    </div>
                  ))}
                  {invitations.length === 0 && <p className="text-xs text-slate-400 italic">No pending invites.</p>}
                </div>
              </section>
              <section className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Sent Requests</h3>
                <div className="space-y-3">
                  {myRequests.slice(0, 2).map(req => (
                    <div key={req.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <p className="text-xs font-bold truncate pr-2">{req.project?.title}</p>
                      <Badge className="bg-white text-indigo-500 text-[8px] border-slate-200">{req.status}</Badge>
                    </div>
                  ))}
                  {myRequests.length === 0 && <p className="text-xs text-slate-400 italic">No sent requests.</p>}
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT: CAMPUS EVENTS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="text-indigo-600" size={20} /> Campus Events
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/events')}
                className="text-indigo-600 font-bold hover:bg-indigo-50"
              >
                View All <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <Skeleton className="h-48 rounded-2xl" />
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <Card key={event.id} className="relative overflow-hidden group border-slate-200 rounded-2xl hover:shadow-lg transition-all">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600" />
                    <CardContent className="p-6">
                      <Badge className="bg-indigo-50 text-indigo-700 border-none font-bold text-[10px] uppercase mb-3">
                        {event.status}
                      </Badge>

                      <h4
                        className="font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors cursor-pointer"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        {event.name}
                      </h4>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                          <Clock size={14} className="text-indigo-500" />
                          {event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBA'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                          <MapPin size={14} /> {event.location || 'Campus Main Hub'}
                        </div>
                      </div>

                      <Button
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="w-full bg-slate-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border-none font-bold rounded-xl h-10 transition-all shadow-none"
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-100">
                  <p className="text-slate-400 text-sm font-medium">No events scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}