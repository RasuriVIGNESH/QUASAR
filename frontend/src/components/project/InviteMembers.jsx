import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search, Users, UserPlus, Check, ArrowLeft,
  Loader2, MapPin, Filter, X, ChevronDown
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import userService from '../../services/userService';
import { projectService } from '../../services/projectService';

export default function InviteMembers() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [error, setError] = useState(null);
  const [invitedUserIds, setInvitedUserIds] = useState([]);
  const [invitationsMap, setInvitationsMap] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  const [filters, setFilters] = useState({
    branch: '',
    graduationYear: '',
    availabilityStatus: '',
    skills: ''
  });

  const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Business', 'Other'];
  const graduationYears = [2024, 2025, 2026, 2027, 2028];
  const availabilityStatuses = ['AVAILABLE', 'BUSY', 'OPEN_TO_WORK', 'OFFLINE'];

  useEffect(() => { fetchStudents(); }, [projectId]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredStudents(students.filter(s =>
      (s.displayName || '').toLowerCase().includes(term) ||
      (s.studentSkills || []).some(sk => (sk.name || '').toLowerCase().includes(term))
    ));
  }, [searchTerm, students]);

  const fetchStudents = async (customFilters = filters) => {
    try {
      setLoading(true);
      setApplyLoading(true);
      const apiParams = { size: 50 };
      if (customFilters.branch && customFilters.branch !== 'ALL') apiParams.branch = customFilters.branch;
      if (customFilters.graduationYear && customFilters.graduationYear !== 'ALL') apiParams.graduationYear = parseInt(customFilters.graduationYear);
      if (customFilters.availabilityStatus && customFilters.availabilityStatus !== 'ALL') apiParams.availabilityStatus = customFilters.availabilityStatus;
      if (customFilters.skills) apiParams.skills = customFilters.skills.split(',').map(s => s.trim()).filter(Boolean);

      const [usersRes, membersRes, projectRes, invitesRes] = await Promise.all([
        userService.discoverUsers(apiParams),
        projectService.getProjectMembers(projectId),
        projectService.getProject(projectId),
        projectService.getProjectInvitations(projectId)
      ]);

      let allStudents = [];
      if (usersRes?.data?.content) allStudents = usersRes.data.content;
      else if (Array.isArray(usersRes?.data)) allStudents = usersRes.data;
      else if (usersRes?.content) allStudents = usersRes.content;
      else if (Array.isArray(usersRes)) allStudents = usersRes;

      const currentMembers = membersRes?.data || (Array.isArray(membersRes) ? membersRes : []);
      const memberIds = new Set(currentMembers.map(m => m.user?.id || m.userId || m.id));

      const projectData = projectRes?.data || projectRes || {};
      const leadId = projectData.lead?.id || projectData.Lead?.id || projectData.leadId;
      if (leadId) memberIds.add(leadId);

      const processed = allStudents
        .filter(s => {
          const sid = s.id || s.userId || s._id;
          return sid && !memberIds.has(sid);
        })
        .map(s => ({
          ...s,
          id: s.id || s.userId || s._id,
          displayName: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          studentSkills: s.skills?.map(sk => {
            if (typeof sk === 'string') return { name: sk };
            if (sk.skill?.name) return { name: sk.skill.name, level: sk.level };
            if (sk.name) return { name: sk.name, level: sk.level };
            return { name: 'Unknown' };
          }) || [],
          collegeName: s.college?.name || s.collage?.name,
          profilePictureUrl: s.profilePictureUrl ||
            (s.profilePhoto ? (s.profilePhoto.startsWith('data:') ? s.profilePhoto : `data:image/jpeg;base64,${s.profilePhoto}`) : null)
        }));

      const invites = invitesRes?.data?.content || invitesRes?.data || (Array.isArray(invitesRes) ? invitesRes : []);
      const newInvitesMap = {};
      if (Array.isArray(invites)) {
        invites.forEach(inv => {
          if (inv.status === 'PENDING') {
            const uId = inv.invitedUser?.id || inv.invitedUserId;
            if (uId) newInvitesMap[uId] = inv.invitationId || inv.id;
          }
        });
      }

      setInvitationsMap(newInvitesMap);
      setInvitedUserIds(Object.keys(newInvitesMap));
      setStudents(processed);
      setFilteredStudents(processed);
    } catch (err) {
      console.error('InviteMembers fetch error:', err);
      setError('Failed to fetch the talent pool.');
    } finally {
      setLoading(false);
      setApplyLoading(false);
    }
  };

  const handleInvite = async (student) => {
    try {
      const resp = await projectService.sendInvitation(projectId, {
        invitedUserId: student.id,
        role: 'MEMBER',
        message: 'Join our team for this project!'
      });
      const invId = resp?.data?.id || resp?.id;
      if (invId) setInvitationsMap(prev => ({ ...prev, [student.id]: invId }));
      setInvitedUserIds(prev => [...prev, student.id]);
      toast.success(`Invitation sent to ${student.displayName}`);
    } catch {
      toast.error('Failed to send invitation.');
    }
  };

  const handleCancelInvite = async (studentId) => {
    const invId = invitationsMap[studentId];
    if (!invId) return;
    try {
      await projectService.cancelInvitation(invId);
      setInvitedUserIds(prev => prev.filter(id => id !== studentId.toString() && id !== studentId));
      setInvitationsMap(prev => { const next = { ...prev }; delete next[studentId]; return next; });
      toast.success('Invitation cancelled');
    } catch {
      toast.error('Failed to cancel invitation.');
    }
  };

  const resetFilters = () => {
    const empty = { branch: '', graduationYear: '', availabilityStatus: '', skills: '' };
    setFilters(empty);
    fetchStudents(empty);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* STICKY HEADER - Professional Minimalist */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="text-slate-600 hover:text-indigo-600 font-bold text-xs px-2 h-9 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Project
          </Button>
          <div className="h-4 w-px bg-slate-200" />
          <h1 className="text-sm font-bold text-slate-900 tracking-tight">
            Recruit Members
          </h1>
        </div>
        <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold px-3 py-1 text-[10px] rounded-full">
          {invitedUserIds.length} Sent
        </Badge>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        {/* HERO SECTION - Clean UI */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Find Talent
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Connect with skilled peers to build your team.</p>
        </div>

        {/* SEARCH & FILTER - Professional UI */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input
                placeholder="Search by name or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-10 rounded-lg bg-white border-slate-200 text-sm shadow-sm"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className={`h-10 px-4 rounded-lg font-bold text-xs border-slate-200 bg-white text-slate-700 ${showFilters ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : ''}`}
            >
              <Filter className="w-3.5 h-3.5 mr-2" /> Filters
            </Button>
          </div>

          {showFilters && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-md space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch</Label>
                  <Select value={filters.branch} onValueChange={(v) => setFilters(p => ({ ...p, branch: v }))}>
                    <SelectTrigger className="h-9 rounded-lg border-slate-200 text-xs">
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="ALL">All Branches</SelectItem>
                      {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Graduation</Label>
                  <Select value={filters.graduationYear} onValueChange={(v) => setFilters(p => ({ ...p, graduationYear: v }))}>
                    <SelectTrigger className="h-9 rounded-lg border-slate-200 text-xs">
                      <SelectValue placeholder="Any Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="ALL">Any Year</SelectItem>
                      {graduationYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Availability</Label>
                  <Select value={filters.availabilityStatus} onValueChange={(v) => setFilters(p => ({ ...p, availabilityStatus: v }))}>
                    <SelectTrigger className="h-9 rounded-lg border-slate-200 text-xs">
                      <SelectValue placeholder="Any Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="ALL">Any Status</SelectItem>
                      {availabilityStatuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skills</Label>
                  <Input
                    value={filters.skills}
                    onChange={(e) => setFilters(p => ({ ...p, skills: e.target.value }))}
                    placeholder="React, UI/UX..."
                    className="h-9 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-50">
                <Button variant="ghost" onClick={resetFilters} size="sm" className="font-bold text-xs text-slate-500">
                  Reset
                </Button>
                <Button
                  onClick={() => fetchStudents(filters)}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 h-9 rounded-lg font-bold text-xs"
                >
                  {applyLoading ? <Loader2 className="animate-spin h-3 w-3 mr-2" /> : 'Apply'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 rounded-lg bg-red-50 text-red-800 border-red-100">
            <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* STUDENT GRID - Professional & Minimalist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="flex gap-1.5 pt-2">
                    <Skeleton className="h-4 w-10 rounded" />
                    <Skeleton className="h-4 w-10 rounded" />
                    <Skeleton className="h-4 w-10 rounded" />
                  </div>
                  <div className="pt-4 border-t border-slate-50">
                    <Skeleton className="h-9 w-full rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredStudents.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-slate-200">
              <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-bold text-sm">No talent found matching your criteria</p>
              <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isInvited = invitedUserIds.includes(student.id.toString()) || invitedUserIds.includes(student.id);
              return (
                <Card key={student.id} className="border-slate-200 rounded-xl bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="h-12 w-12 border border-slate-100 group-hover:border-indigo-100 transition-colors">
                        <AvatarImage src={student.profilePictureUrl} />
                        <AvatarFallback className="bg-indigo-50 text-indigo-700 text-sm font-bold">
                          {student.displayName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                          {student.displayName}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          {student.branch} • {student.graduationYear}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={10} className="text-slate-300" />
                          <span className="text-[10px] text-slate-400 font-medium truncate">{student.collegeName || 'Campus'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-5 min-h-[40px]">
                      {student.studentSkills?.slice(0, 4).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-slate-50 text-slate-500 border-none font-bold text-[9px] px-1.5 py-0">
                          {skill.name}
                        </Badge>
                      ))}
                      {student.studentSkills?.length > 4 && (
                        <span className="text-[9px] font-bold text-slate-300">+{student.studentSkills.length - 4} more</span>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-50">
                      {isInvited ? (
                        <Button
                          variant="outline"
                          onClick={() => handleCancelInvite(student.id)}
                          className="w-full h-9 rounded-lg border-indigo-100 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-xs"
                        >
                          <Check className="w-3.5 h-3.5 mr-1.5" /> Invited
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleInvite(student)}
                          className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm"
                        >
                          <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Invite to Team
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
