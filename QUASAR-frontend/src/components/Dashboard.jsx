import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, Plus, Briefcase, Bell, Calendar, MapPin,
  ArrowRight, Clock, ChevronRight
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [projectsRes, invitesRes, requestsRes, eventsRes] = await Promise.all([
          projectService.getMyProjects(0, 6),
          projectService.getReceivedInvitations(),
          joinRequestService.getMyJoinRequests(),
          dataService.getUpcomingEvents()
        ]);

        setMyProjects(projectsRes?.data?.content || projectsRes?.content || []);
        setInvitations(Array.isArray(invitesRes) ? invitesRes : (invitesRes?.data || []));
        setMyRequests(Array.isArray(requestsRes) ? requestsRes : (requestsRes?.data || []));
        setUpcomingEvents(Array.isArray(eventsRes) ? eventsRes : (eventsRes?.data || []));
      } catch (err) {
        console.error('Dashboard Data Fetch Error:', err);
        setError("Unable to sync with logic core.");
        toast.error("Failed to sync dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) fetchDashboardData();
  }, [userProfile]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* HEADER - Professional Minimalist */}
      <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Good day, {userProfile?.firstName}
            </h2>
            <p className="text-slate-500 text-sm font-medium">Here's what's happening with your projects.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/projects/create')}
              className="bg-indigo-600 hover:bg-indigo-700 h-10 px-5 rounded-lg font-semibold text-sm transition-all"
            >
              <Plus size={18} className="mr-2" /> New Project
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: PROJECTS & REQUESTS */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="text-indigo-600" size={18} /> Active Workspace
              </h3>
              <button
                onClick={() => navigate('/projects/my-projects')}
                className="text-indigo-600 text-sm font-bold hover:underline flex items-center"
              >
                View All <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <Card key={i} className="border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="pt-4 border-t border-slate-50 flex justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : myProjects.length > 0 ? (
                myProjects.map((p) => (
                  <Card
                    key={p.id}
                    className="hover:border-indigo-200 hover:shadow-md transition-all border-slate-200 rounded-xl cursor-pointer bg-white group"
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{p.title}</h4>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] uppercase px-2 py-0">
                          {p.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-5 leading-relaxed h-10">{p.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400">Lead: {p.lead?.firstName}</span>
                        <div className="flex items-center gap-1 text-slate-400 text-[11px] font-bold">
                          <Users size={12} /> {p.currentTeamSize}/{p.maxTeamSize}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm">No active projects yet.</p>
                </div>
              )}
            </div>

            {/* QUICK REQUESTS VIEW - Instagram-like cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invitations</h3>
                  {invitations.length > 0 && <span className="w-2 h-2 bg-indigo-600 rounded-full" />}
                </div>
                <div className="space-y-2">
                  {loading ? (
                    [1, 2].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
                  ) : invitations.length > 0 ? (
                    invitations.slice(0, 3).map(inv => (
                      <div key={inv.invitationId || inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs font-bold text-slate-700 truncate flex-1 mr-2">{inv.project?.title || 'Project Invitation'}</p>
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2" onClick={() => navigate('/messages')}>View</Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">No pending invitations.</p>
                  )}
                </div>
              </section>

              <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sent Requests</h3>
                </div>
                <div className="space-y-2">
                  {loading ? (
                    [1, 2].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
                  ) : myRequests.length > 0 ? (
                    myRequests.slice(0, 3).map(req => (
                      <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs font-bold text-slate-700 truncate flex-1 mr-2">{req.project?.title}</p>
                        <Badge variant="outline" className={`text-[9px] font-bold border-slate-200 ${req.status === 'PENDING' ? 'text-amber-600' : 'text-indigo-600'}`}>
                          {req.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">No sent requests.</p>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT: CAMPUS EVENTS - Professional Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="text-indigo-600" size={18} /> Campus Events
              </h3>
              <button
                onClick={() => navigate('/events')}
                className="text-indigo-600 text-sm font-bold hover:underline flex items-center"
              >
                All <ChevronRight size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                [1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 3).map((event) => (
                  <Card key={event.id} className="border-slate-200 rounded-xl hover:border-indigo-200 transition-all bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className="bg-indigo-50 text-indigo-700 border-none font-bold text-[9px] uppercase px-1.5 py-0">
                          {event.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                          <Clock size={12} />
                          {event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBA'}
                        </div>
                      </div>

                      <h4
                        className="font-bold text-slate-900 text-sm mb-3 hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        {event.name}
                      </h4>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mb-4">
                        <MapPin size={12} /> {event.location || 'Campus Main Hub'}
                      </div>

                      <Button
                        onClick={() => navigate(`/events/${event.id}`)}
                        variant="outline"
                        className="w-full h-8 text-[11px] font-bold rounded-lg border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-xs font-medium">No events scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
