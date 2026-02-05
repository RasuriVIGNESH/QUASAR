import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader2, Sparkles, MapPin, GraduationCap, Trophy, Filter, X,
  ChevronRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import userService from '../../services/userService';
import { projectService } from '../../services/projectService';

export default function InviteMembers() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [invitedUserIds, setInvitedUserIds] = useState([]);
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

  useEffect(() => {
    fetchStudents();
  }, [projectId]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredStudents(students.filter(s =>
      s.displayName.toLowerCase().includes(term) ||
      s.studentSkills.some(skill => skill.toLowerCase().includes(term))
    ));
  }, [searchTerm, students]);

  const fetchStudents = async (customFilters = filters) => {
    try {
      setLoading(true);
      const apiParams = { size: 50 };
      if (customFilters.branch && customFilters.branch !== 'ALL') apiParams.branch = customFilters.branch;
      if (customFilters.graduationYear && customFilters.graduationYear !== 'ALL') apiParams.graduationYear = parseInt(customFilters.graduationYear);
      if (customFilters.availabilityStatus && customFilters.availabilityStatus !== 'ALL') apiParams.availabilityStatus = customFilters.availabilityStatus;
      if (customFilters.skills) apiParams.skills = customFilters.skills.split(',').map(s => s.trim()).filter(Boolean);

      const [usersRes, membersRes, projectRes] = await Promise.all([
        userService.discoverUsers(apiParams),
        projectService.getProjectMembers(projectId),
        projectService.getProject(projectId)
      ]);

      const allStudents = usersRes?.data?.content || usersRes?.data || [];
      const currentMembers = membersRes?.data || [];
      const memberIds = new Set(currentMembers.map(m => m.user.id));
      const leadId = projectRes?.lead?.id || projectRes?.Lead?.id;
      if (leadId) memberIds.add(leadId);

      const processed = allStudents
        .filter(s => !memberIds.has(s.id || s.userId || s._id))
        .map(s => ({
          ...s,
          id: s.id || s.userId || s._id,
          displayName: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          // Handle nested skill objects from response structure
          studentSkills: s.skills?.map(sk => {
            if (typeof sk === 'string') return { name: sk };
            if (sk.skill?.name) return { name: sk.skill.name, level: sk.level };
            if (sk.name) return { name: sk.name, level: sk.level };
            return { name: 'Unknown' };
          }) || [],
          collegeName: s.college?.name || s.collage?.name,
          // Handle base64 photo if it doesn't have prefix, prioritize existing URLs
          profilePictureUrl: s.profilePictureUrl || s.profileImage ||
            (s.profilePhoto ? (s.profilePhoto.startsWith('data:') ? s.profilePhoto : `data:image/jpeg;base64,${s.profilePhoto}`) : null)
        }));

      setStudents(processed);
      setFilteredStudents(processed);
    } catch (err) {
      setError('Failed to fetch the talent pool.');
    } finally {
      setLoading(false);
      setApplyLoading(false);
    }
  };

  const handleInvite = async (student) => {
    try {
      await projectService.sendInvitation(projectId, {
        invitedUserId: student.id,
        role: 'MEMBER',
        message: `Join our team for this project!`
      });
      setInvitedUserIds(prev => [...prev, student.id]);
    } catch (err) {
      alert("Invitation failed to send.");
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Scanning Talent Pool...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="text-slate-600 hover:text-blue-600 font-bold text-xs p-0 px-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> EXIT RECRUITMENT
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">Peers for {projectId?.slice(0, 6)}</h1>
        </div>
        <Badge className="bg-blue-50 text-blue-700 border-none font-black px-3 py-1 text-[10px]">
          {invitedUserIds.length} INVITED
        </Badge>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight"
          >
            Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Dream Team.</span>
          </motion.h2>
          <p className="text-slate-500 mt-3 font-medium text-lg">Browse skilled peers from your campus and beyond.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-10 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                placeholder="Search peers by name or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 pl-12 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all text-base"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "secondary" : "outline"}
              className={`h-14 px-6 rounded-xl font-bold transition-all ${showFilters ? 'bg-blue-50 text-blue-600' : 'border-slate-200 bg-white'}`}
            >
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch</Label>
                    <Select value={filters.branch} onValueChange={(v) => setFilters(p => ({ ...p, branch: v }))}>
                      <SelectTrigger className="h-11 rounded-lg border-slate-200"><SelectValue placeholder="All Branches" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Branches</SelectItem>
                        {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Graduation Year</Label>
                    <Select value={filters.graduationYear} onValueChange={(v) => setFilters(p => ({ ...p, graduationYear: v }))}>
                      <SelectTrigger className="h-11 rounded-lg border-slate-200"><SelectValue placeholder="Any Year" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Any Year</SelectItem>
                        {graduationYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</Label>
                    <Select value={filters.availabilityStatus} onValueChange={(v) => setFilters(p => ({ ...p, availabilityStatus: v }))}>
                      <SelectTrigger className="h-11 rounded-lg border-slate-200"><SelectValue placeholder="Any Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Any Status</SelectItem>
                        {availabilityStatuses.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skills</Label>
                    <Input
                      value={filters.skills}
                      onChange={(e) => setFilters(p => ({ ...p, skills: e.target.value }))}
                      placeholder="React, Java..."
                      className="h-11 border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-8 border-t border-slate-50 pt-6">
                  <Button variant="ghost" onClick={() => fetchStudents({ branch: '', graduationYear: '', availabilityStatus: '', skills: '' })} className="font-bold text-slate-500">Reset</Button>
                  <Button onClick={() => fetchStudents()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11 rounded-lg font-bold shadow-lg shadow-blue-100">
                    {applyLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Refresh Talent Pool"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && <Alert variant="destructive" className="mb-8 rounded-xl bg-red-50 text-red-800 border-red-100"><AlertDescription>{error}</AlertDescription></Alert>}

        {/* Talent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i}>
                  <Card className="h-full bg-white border-slate-200 shadow-sm flex flex-col p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Skeleton className="h-14 w-14 rounded-xl bg-slate-100" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4 bg-slate-100" />
                        <Skeleton className="h-3 w-1/2 bg-slate-100" />
                      </div>
                    </div>
                    <div className="space-y-4 mb-6 flex-grow">
                      <Skeleton className="h-3 w-1/3 bg-slate-100" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full bg-slate-100" />
                        <Skeleton className="h-3 w-5/6 bg-slate-100" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-5 w-16 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-16 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-16 rounded bg-slate-100" />
                      </div>
                    </div>
                    <Skeleton className="h-11 w-full rounded-lg bg-slate-100" />
                  </Card>
                </div>
              ))
            ) : filteredStudents.map((student, idx) => {
              const isInvited = invitedUserIds.includes(student.id);
              return (
                <motion.div
                  key={student.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="h-full bg-white border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-14 w-14 rounded-xl shadow-sm border border-slate-100">
                          <AvatarImage src={student.profilePictureUrl || student.profileImage} />
                          <AvatarFallback className="bg-blue-600 text-white font-black text-lg">{student.displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{student.displayName}</h3>
                            {student.availabilityStatus && (
                              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-5 font-bold border-0 ${student.availabilityStatus === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' :
                                student.availabilityStatus === 'OPEN_TO_WORK' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {student.availabilityStatus.replace(/_/g, ' ')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{student.branch || 'Student'}</span>
                            {student.graduationYear && (
                              <>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-[10px] font-bold text-slate-500">'{student.graduationYear.toString().slice(-2)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 mb-6 flex-grow">
                        {student.collegeName && (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <MapPin className="h-3 w-3 text-blue-600 shrink-0" />
                            <span className="truncate">{student.collegeName}</span>
                          </div>
                        )}

                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                          "{student.bio || 'Ready to contribute my skills to high-impact campus projects.'}"
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {student.studentSkills.slice(0, 5).map((skill, si) => (
                            <Badge key={si} variant="secondary" className="bg-white border border-slate-200 text-slate-600 font-bold text-[10px] px-2 hover:border-blue-300 transition-colors cursor-default">
                              {skill.name}
                              {skill.level && <span className="ml-1 text-[8px] opacity-60 font-medium border-l border-slate-200 pl-1">{skill.level}</span>}
                            </Badge>
                          ))}
                          {student.studentSkills.length > 5 && (
                            <span className="text-[9px] font-black text-slate-400 py-1 px-1">+{student.studentSkills.length - 5}</span>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleInvite(student)}
                        disabled={isInvited || !student.id}
                        className={`w-full h-11 rounded-lg font-bold transition-all ${isInvited
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                      >
                        {isInvited ? (
                          <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Invited</span>
                        ) : (
                          <span className="flex items-center gap-2"><UserPlus className="h-4 w-4" /> Send Invitation</span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 border-dashed">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">No matching talent found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or search keywords.</p>
            <Button variant="link" onClick={() => fetchStudents({ branch: '', graduationYear: '', availabilityStatus: '', skills: '' })} className="text-blue-600 font-bold">Clear All Filters</Button>
          </div>
        )}
      </main>
    </div>
  );
}