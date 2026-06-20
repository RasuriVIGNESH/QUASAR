import React, { useState, useEffect, useCallback } from 'react';
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
  Loader2, MapPin, Filter, Github, Linkedin, Globe,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import userService from '../../services/userService';
import { projectService } from '../../services/projectService';

// Matches the default page size used by GET /sort, kept smaller here for a clean 3-col grid.
const PAGE_SIZE = 12;

const AVAILABILITY_STYLES = {
  AVAILABLE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  OPEN_TO_WORK: 'bg-blue-50 text-blue-600 border-blue-100',
  BUSY: 'bg-amber-50 text-amber-600 border-amber-100',
  OFFLINE: 'bg-slate-50 text-slate-400 border-slate-100',
};

const formatAvailability = (status) => {
  if (!status) return 'Unknown';
  return status
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
};

// Builds a windowed list of 0-based page numbers with '...' gaps, e.g. [0, '...', 4, 5, 6, '...', 11]
const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages = new Set([0, total - 1, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, idx) => {
    if (idx > 0 && p - sorted[idx - 1] > 1) result.push('...');
    result.push(p);
  });
  return result;
};

const emptyPageMeta = {
  pageNumber: 0,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  numberOfElements: 0,
};

export default function InviteMembers() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [initializing, setInitializing] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [error, setError] = useState(null);
  const [invitedUserIds, setInvitedUserIds] = useState([]);
  const [invitationsMap, setInvitationsMap] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [excludedIds, setExcludedIds] = useState(new Set()); // current members + lead
  const [pageMeta, setPageMeta] = useState(emptyPageMeta);

  const [filters, setFilters] = useState({
    branch: '',
    graduationYear: '',
    availabilityStatus: '',
    skills: ''
  });

  const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Business', 'Other'];
  const graduationYears = [2024, 2025, 2026, 2027, 2028];
  const availabilityStatuses = ['AVAILABLE', 'BUSY', 'OPEN_TO_WORK', 'OFFLINE'];

  // One-time load of project context: current members, lead, and pending invitations.
  // These don't change as the user pages or filters through /sort, so they're kept separate.
  useEffect(() => {
    const loadProjectContext = async () => {
      try {
        setInitializing(true);
        setError(null);
        const [membersRes, projectRes, invitesRes] = await Promise.all([
          projectService.getProjectMembers(projectId),
          projectService.getProject(projectId),
          projectService.getProjectInvitations(projectId)
        ]);

        const currentMembers = membersRes?.data || (Array.isArray(membersRes) ? membersRes : []);
        const ids = new Set(currentMembers.map(m => m.user?.id || m.userId || m.id));

        const projectData = projectRes?.data || projectRes || {};
        const leadId = projectData.lead?.id || projectData.Lead?.id || projectData.leadId;
        if (leadId) ids.add(leadId);

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

        setExcludedIds(ids);
        setInvitationsMap(newInvitesMap);
        setInvitedUserIds(Object.keys(newInvitesMap));
      } catch (err) {
        console.error('InviteMembers context error:', err);
        setError('Failed to load project context.');
      } finally {
        setInitializing(false);
      }
    };
    loadProjectContext();
  }, [projectId]);

  // Fetches a single page from GET /sort using the filters the controller supports
  // (skills, branch, graduationYear, availabilityStatus) plus page/size for pagination.
  const fetchUsers = useCallback(async (customFilters, pageNum, excluded) => {
    try {
      setUsersLoading(true);
      setError(null);

      const apiParams = { page: pageNum, size: PAGE_SIZE };
      if (customFilters.branch && customFilters.branch !== 'ALL') apiParams.branch = customFilters.branch;
      if (customFilters.graduationYear && customFilters.graduationYear !== 'ALL') apiParams.graduationYear = parseInt(customFilters.graduationYear);
      if (customFilters.availabilityStatus && customFilters.availabilityStatus !== 'ALL') apiParams.availabilityStatus = customFilters.availabilityStatus;
      if (customFilters.skills) apiParams.skills = customFilters.skills.split(',').map(s => s.trim()).filter(Boolean);

      const usersRes = await userService.discoverUsers(apiParams);
      const pageData = usersRes?.data || usersRes || {};
      const rawContent = Array.isArray(pageData.content)
        ? pageData.content
        : (Array.isArray(pageData) ? pageData : []);

      const processed = rawContent
        .filter(s => {
          const sid = s.id || s.userId || s._id;
          return sid && !excluded.has(sid);
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

      setStudents(processed);
      setFilteredStudents(processed);
      setPageMeta({
        pageNumber: pageData.pageNumber ?? pageNum,
        totalElements: pageData.totalElements ?? processed.length,
        totalPages: pageData.totalPages ?? 1,
        first: pageData.first ?? pageNum === 0,
        last: pageData.last ?? true,
        numberOfElements: pageData.numberOfElements ?? rawContent.length,
      });
    } catch (err) {
      console.error('InviteMembers fetch error:', err);
      setError('Failed to fetch the talent pool.');
    } finally {
      setUsersLoading(false);
      setApplyLoading(false);
    }
  }, []);

  // Load the first page of users once we know who to exclude (members + lead).
  useEffect(() => {
    if (!initializing) {
      fetchUsers(filters, 0, excludedIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializing]);

  // Quick client-side narrowing of the currently loaded page by name/skill.
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredStudents(students.filter(s =>
      (s.displayName || '').toLowerCase().includes(term) ||
      (s.studentSkills || []).some(sk => (sk.name || '').toLowerCase().includes(term))
    ));
  }, [searchTerm, students]);

  const handleApplyFilters = () => {
    setApplyLoading(true);
    fetchUsers(filters, 0, excludedIds);
  };

  const resetFilters = () => {
    const empty = { branch: '', graduationYear: '', availabilityStatus: '', skills: '' };
    setFilters(empty);
    setApplyLoading(true);
    fetchUsers(empty, 0, excludedIds);
  };

  const goToPage = (pageNum) => {
    if (pageNum < 0 || pageNum >= pageMeta.totalPages || pageNum === pageMeta.pageNumber || usersLoading) return;
    fetchUsers(filters, pageNum, excludedIds);
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

  const loading = initializing || usersLoading;
  const pageRangeStart = pageMeta.totalElements === 0 ? 0 : pageMeta.pageNumber * PAGE_SIZE + 1;
  const pageRangeEnd = pageMeta.pageNumber * PAGE_SIZE + pageMeta.numberOfElements;

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
            Find Talent
          </h1>
        </div>
        <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold px-3 py-1 text-[10px] rounded-full">
          {invitedUserIds.length} Sent
        </Badge>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
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
                  onClick={handleApplyFilters}
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
              const hasSocialLinks = student.githubUrl || student.linkedinUrl || student.portfolioUrl;
              return (
                <Card key={student.id} className="border-slate-200 rounded-xl bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="flex items-start gap-3 min-w-0">
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

                      <span
                        title={`Availability: ${formatAvailability(student.availabilityStatus)}`}
                        className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold whitespace-nowrap ${AVAILABILITY_STYLES[student.availabilityStatus] || AVAILABILITY_STYLES.OFFLINE}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {formatAvailability(student.availabilityStatus)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4 min-h-[20px]">
                      {student.studentSkills?.slice(0, 4).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-slate-50 text-slate-500 border-none font-bold text-[9px] px-1.5 py-0">
                          {skill.name}
                        </Badge>
                      ))}
                      {student.studentSkills?.length > 4 && (
                        <span className="text-[9px] font-bold text-slate-300">+{student.studentSkills.length - 4} more</span>
                      )}
                    </div>

                    {hasSocialLinks && (
                      <div className="flex items-center gap-2 mb-4">
                        {student.githubUrl && (
                          <a
                            href={student.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="GitHub"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                          >
                            <Github size={13} />
                          </a>
                        )}
                        {student.linkedinUrl && (
                          <a
                            href={student.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="LinkedIn"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                          >
                            <Linkedin size={13} />
                          </a>
                        )}
                        {student.portfolioUrl && (
                          <a
                            href={student.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Portfolio"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                          >
                            <Globe size={13} />
                          </a>
                        )}
                      </div>
                    )}

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

        {/* PAGINATION - server-driven via PagedResponse (pageNumber, totalPages, totalElements, first, last, numberOfElements) */}
        {!loading && pageMeta.totalElements > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-medium text-slate-400">
              Showing {pageRangeStart}–{pageRangeEnd} of {pageMeta.totalElements} results
            </p>

            {pageMeta.totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageMeta.first}
                  onClick={() => goToPage(pageMeta.pageNumber - 1)}
                  className="h-8 px-3 rounded-lg border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                </Button>

                {getPageNumbers(pageMeta.pageNumber, pageMeta.totalPages).map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-slate-300 font-bold">…</span>
                  ) : (
                    <Button
                      key={p}
                      size="sm"
                      onClick={() => goToPage(p)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold ${p === pageMeta.pageNumber
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
                        }`}
                    >
                      {p + 1}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageMeta.last}
                  onClick={() => goToPage(pageMeta.pageNumber + 1)}
                  className="h-8 px-3 rounded-lg border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}