import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, Plus, Briefcase, Bell, Calendar, MapPin,
  ArrowRight, Clock, ChevronRight, MoreVertical, Code2,
  Zap, TrendingUp, AlertCircle, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

// Import refactored services
import { projectService } from '@/services/projectService';
import { joinRequestService } from '@/services/JoinRequestService';
import { dataService } from '@/services/dataService';

// --- HELPER COMPONENTS ---

// Empty State Illustration Component
const EmptyStateIllustration = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
      <Icon className="text-indigo-600" size={32} />
    </div>
    <h3 className="text-slate-900 font-bold text-sm mb-1">{title}</h3>
    <p className="text-slate-400 text-xs">{description}</p>
  </div>
);

// Tech Stack Tags Component
const TechStackTags = ({ techStack = [] }) => {
  const displayTechs = techStack.slice(0, 2);
  const remaining = techStack.length - 2;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayTechs.map((tech, idx) => (
        <span key={idx} className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
          {tech}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
          +{remaining}
        </span>
      )}
    </div>
  );
};

// Project Progress Bar Component
const ProjectProgress = ({ currentTeamSize, maxTeamSize }) => {
  const percentage = Math.round(((currentTeamSize + 1) / maxTeamSize) * 100);
  const isNearFull = percentage >= 80;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Capacity</span>
        <span className={`text-[10px] font-bold ${isNearFull ? 'text-amber-600' : 'text-slate-600'}`}>
          {currentTeamSize + 1}/{maxTeamSize}
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isNearFull ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
            }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Calendar Date Block Component
const CalendarDateBlock = ({ date }) => {
  const dateObj = new Date(date);
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = dateObj.getDate();

  return (
    <div className="flex flex-col items-center justify-center w-12 h-12 bg-indigo-50 rounded-lg border border-indigo-100">
      <span className="text-[9px] font-bold text-indigo-600">{month}</span>
      <span className="text-sm font-black text-indigo-700">{day}</span>
    </div>
  );
};

// Invitation Avatar Component
const InvitationAvatar = ({ firstName, lastName }) => {
  const initials = `${firstName?.[0] || 'U'}${lastName?.[0] || 'U'}`.toUpperCase();
  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  const colorIndex = initials.charCodeAt(0) % colors.length;

  return (
    <div className={`w-8 h-8 ${colors[colorIndex]} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
      {initials}
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 pb-20">
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: PROJECTS & REQUESTS - Bento Grid Style */}
          <div className="lg:col-span-8 space-y-8">

            {/* ACTIVE WORKSPACE SECTION */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-950 flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Briefcase className="text-indigo-600" size={20} />
                  </div>
                  Active Workspace
                </h3>
                <button
                  onClick={() => navigate('/projects/my-projects')}
                  className="text-indigo-600 text-sm font-bold hover:text-indigo-700 transition-colors flex items-center gap-1"
                >
                  View All <ChevronRight size={16} />
                </button>
              </div>

              {/* Bento Grid for Projects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  [1, 2, 3, 4].map(i => (
                    <Card key={i} className="border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between">
                          <Skeleton className="h-6 w-40 rounded-lg" />
                          <Skeleton className="h-5 w-20 rounded-lg" />
                        </div>
                        <Skeleton className="h-4 w-full rounded-lg" />
                        <Skeleton className="h-4 w-2/3 rounded-lg" />
                        <div className="pt-4 space-y-3">
                          <Skeleton className="h-2 w-full rounded-full" />
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-16 rounded-lg" />
                            <Skeleton className="h-6 w-16 rounded-lg" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : myProjects.length > 0 ? (
                  myProjects.map((p) => (
                    <Card
                      key={p.id}
                      className="border-slate-200 rounded-2xl cursor-pointer bg-white group hover:border-indigo-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-black text-slate-950 group-hover:text-indigo-600 transition-colors line-clamp-1 text-lg">
                              {p.title}
                            </h4>
                            <p className="text-sm text-slate-500 line-clamp-2 mt-1 leading-relaxed h-10">
                              {p.description}
                            </p>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                              <MoreVertical size={16} className="text-slate-400" />
                            </button>
                          </div>
                        </div>

                        {/* Tech Stack Tags */}
                        {p.techStack && p.techStack.length > 0 && (
                          <TechStackTags techStack={p.techStack} />
                        )}

                        {/* Project Progress */}
                        <ProjectProgress currentTeamSize={p.currentTeamSize} maxTeamSize={p.maxTeamSize} />

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-[10px] font-bold">
                              {p.lead?.firstName?.[0] || 'L'}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600">
                              {p.lead?.firstName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg">
                            <Users size={12} className="text-slate-400" />
                            <span className="text-[11px] font-black text-slate-700">
                              {p.currentTeamSize + 1}/{p.maxTeamSize}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                    <EmptyStateIllustration
                      icon={Briefcase}
                      title="No Active Projects"
                      description="Create your first project to get started"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* INVITATIONS & REQUESTS - Social Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* INVITATIONS CARD */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
                      <Bell size={16} className="text-indigo-600" />
                      Invitations
                    </h3>
                    {invitations.length > 0 && (
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full">
                        {invitations.length}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  {loading ? (
                    [1, 2].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)
                  ) : invitations.length > 0 ? (
                    invitations.slice(0, 3).map(inv => (
                      <div
                        key={inv.invitationId || inv.id}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-transparent rounded-xl border border-indigo-100 hover:border-indigo-200 transition-all cursor-pointer group"
                        onClick={() => navigate('/messages')}
                      >
                        <InvitationAvatar
                          firstName={inv.project?.lead?.firstName || 'Project'}
                          lastName={inv.project?.lead?.lastName}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {inv.project?.title || 'Project Invitation'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Invited to join
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    ))
                  ) : (
                    <EmptyStateIllustration
                      icon={Bell}
                      title="No Invitations"
                      description="You'll see invitations here"
                    />
                  )}

                  {invitations.length > 3 && (
                    <button className="w-full py-2 text-center text-indigo-600 text-sm font-bold hover:bg-indigo-50 rounded-lg transition-colors">
                      View All Invitations
                    </button>
                  )}
                </div>
              </div>

              {/* SENT REQUESTS CARD */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
                      <ArrowRight size={16} className="text-emerald-600" />
                      Sent Requests
                    </h3>
                    {myRequests.length > 0 && (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full">
                        {myRequests.length}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  {loading ? (
                    [1, 2].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)
                  ) : myRequests.length > 0 ? (
                    myRequests.slice(0, 3).map(req => (
                      <div
                        key={req.id}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-transparent rounded-xl border border-emerald-100 hover:border-emerald-200 transition-all"
                      >
                        <div className="flex-shrink-0">
                          {req.status === 'PENDING' ? (
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                              <Clock size={14} className="text-amber-600" />
                            </div>
                          ) : req.status === 'ACCEPTED' ? (
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                              <CheckCircle2 size={14} className="text-emerald-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                              <AlertCircle size={14} className="text-slate-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {req.project?.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {req.status === 'PENDING' ? 'Awaiting response' : req.status}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-black border-0 ${req.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700'
                            : req.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-50 text-slate-700'
                            }`}
                        >
                          {req.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <EmptyStateIllustration
                      icon={ArrowRight}
                      title="No Sent Requests"
                      description="Apply to projects to see them here"
                    />
                  )}

                  {myRequests.length > 3 && (
                    <button className="w-full py-2 text-center text-emerald-600 text-sm font-bold hover:bg-emerald-50 rounded-lg transition-colors">
                      View All Requests
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: CAMPUS EVENTS - Sticky Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-950 flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Calendar className="text-indigo-600" size={20} />
                  </div>
                  Campus Events
                </h3>
                <button
                  onClick={() => navigate('/events')}
                  className="text-indigo-600 text-sm font-bold hover:text-indigo-700 transition-colors flex items-center gap-1"
                >
                  All <ChevronRight size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  [1, 2].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
                ) : upcomingEvents.length > 0 ? (
                  upcomingEvents.slice(0, 3).map((event) => (
                    <Card
                      key={event.id}
                      className="border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-lg transition-all bg-white shadow-sm overflow-hidden cursor-pointer group"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <CardContent className="p-5 space-y-4">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold text-[9px] uppercase px-2 py-1">
                              {event.status}
                            </Badge>
                            <h4 className="font-black text-slate-950 text-sm mt-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                              {event.name}
                            </h4>
                          </div>
                          {event.startDate && (
                            <CalendarDateBlock date={event.startDate} />
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{event.location || 'Campus Main Hub'}</span>
                        </div>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${event.id}`);
                          }}
                          className="w-full h-9 text-[11px] font-bold rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 transition-all"
                        >
                          View Details <ArrowRight size={12} className="ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                    <EmptyStateIllustration
                      icon={Calendar}
                      title="No Events Scheduled"
                      description="Check back soon for campus events"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
