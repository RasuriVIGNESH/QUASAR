import React, { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UserPlus, Bookmark, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import recommendationService from '@/services/recommendationService';
import teamService from '@/services/TeamService';

const list = response => {
  const envelope = response?.data ?? response;
  const body = envelope?.data ?? envelope;
  return Array.isArray(body) ? body : body?.content || body?.skills || body?.gaps || [];
};
const idOf = candidate => candidate?.student?.id;
const nameOf = candidate => [candidate?.student?.firstName, candidate?.student?.lastName].filter(Boolean).join(' ') || 'Student';
const skillsOf = candidate => candidate?.skillsToFill || [];

export default function RecruitingPanel({ projectId, requiredRoles = [], selectedRoleId = '' }) {
  const [gaps, setGaps] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const openRoles = requiredRoles.filter(role => !role.filled);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gapResponse, candidateResponse] = await Promise.all([
        recommendationService.getSkillGaps(projectId),
        recommendationService.getRecommendedMembers(projectId, 0, 20),
      ]);
      setGaps(list(gapResponse));
      setCandidates(list(candidateResponse));
    } catch (error) {
      toast.error(error.message || 'Unable to load recruiting recommendations');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const feedback = async (candidate, action) => {
    const candidateId = idOf(candidate);
    setBusy(prev => ({ ...prev, [candidateId]: action }));
    try {
      await recommendationService.sendCandidateFeedback(projectId, candidateId, action);
      if (action !== 'SAVED') setCandidates(prev => prev.filter(item => idOf(item) !== candidateId));
      toast.success(action === 'SAVED' ? 'Candidate saved' : 'Recommendation updated');
    } catch (error) {
      toast.error(error.message || 'Could not update recommendation');
    } finally {
      setBusy(prev => ({ ...prev, [candidateId]: null }));
    }
  };

  const invite = async candidate => {
    const candidateId = idOf(candidate);
    if (openRoles.length > 0 && !selectedRoleId) {
      toast.error('Select an open project role before sending an invitation.');
      return;
    }
    if (requiredRoles.length > 0 && openRoles.length === 0) {
      toast.error('All project roles are filled. No more invitations can be sent.');
      return;
    }
    setBusy(prev => ({ ...prev, [candidateId]: 'INVITE' }));
    try {
      await teamService.inviteUserToProject(projectId, candidateId, 'We think your skills could help our project.', selectedRoleId || undefined);
      setCandidates(prev => prev.map(item => idOf(item) === candidateId ? { ...item, invitationSent: true } : item));
      toast.success(`Invitation sent to ${nameOf(candidate)}`);
    } catch (error) {
      toast.error(error?.message || error?.data?.message || 'Could not send invitation');
    } finally {
      setBusy(prev => ({ ...prev, [candidateId]: null }));
    }
  };

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return <div className="space-y-6">
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-6">
      <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-900">Team skill gaps</h2><p className="mt-1 text-xs text-slate-500">Use these gaps to review the right candidates.</p></div><Badge className="border-none bg-indigo-50 text-indigo-700">{gaps.length} requirements</Badge></div>
      {gaps.length === 0 ? <p className="text-sm text-slate-500">No skill gaps were returned for this project.</p> : <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{gaps.map((gap, index) => { const state = gap.coverage || 'MISSING'; const style = state === 'COVERED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : state === 'NEEDS_MORE' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-rose-50 border-rose-200 text-rose-700'; return <div key={`${gap.skillName || 'skill'}-${index}`} className={`rounded-xl border p-3 ${style}`}><div className="flex items-center justify-between gap-2"><span className="text-sm font-bold">{gap.skillName || 'Required skill'}</span>{state === 'COVERED' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}</div><span className="text-[10px] font-black uppercase tracking-wider">{state.replace('_', ' ')}</span></div>; })}</div>}
    </CardContent></Card>

    <div className="flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-900">Recommended members</h2><p className="mt-1 text-xs text-slate-500">Review candidates and invite them for the selected role above.</p></div><Badge variant="outline">{candidates.length} matches</Badge></div>
    {candidates.length === 0 ? <Card className="rounded-2xl border-dashed border-slate-300 bg-white"><CardContent className="py-14 text-center text-sm text-slate-500">No available candidates match the current skill gaps.</CardContent></Card> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{candidates.map(candidate => { const id = idOf(candidate); const action = busy[id]; const student = candidate.student || {}; return <Card key={id} className="rounded-2xl border-slate-200 bg-white"><CardContent className="p-5"><div className="flex gap-3"><Avatar><AvatarImage src={student.profilePictureUrl} /><AvatarFallback className="bg-indigo-100 text-indigo-700">{nameOf(candidate)[0]}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><div><h3 className="truncate font-bold text-slate-900">{nameOf(candidate)}</h3><p className="text-xs text-slate-500">{candidate.availabilityStatus || 'Availability not specified'} · {candidate.activeProjectCount ?? 0} active projects</p></div><Badge className="border-none bg-indigo-50 text-indigo-700">{candidate.matchScore}%</Badge></div><div className="mt-3 flex flex-wrap gap-1.5">{skillsOf(candidate).slice(0, 4).map(skill => <span key={skill} className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{skill}</span>)}</div><p className="mt-3 text-xs text-slate-500">{candidate.reasons?.join(' ') || 'Strong fit for the project team.'}</p></div></div><div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4"><Button size="sm" onClick={() => invite(candidate)} disabled={!!action || candidate.invitationSent || (openRoles.length > 0 && !selectedRoleId) || (requiredRoles.length > 0 && openRoles.length === 0)} className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{action === 'INVITE' ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} className="mr-1" />}{candidate.invitationSent ? 'Invitation sent' : requiredRoles.length > 0 && openRoles.length === 0 ? 'No open roles' : openRoles.length > 0 && !selectedRoleId ? 'Select a role first' : 'Invite'}</Button><Button size="sm" variant="ghost" onClick={() => feedback(candidate, 'SAVED')} disabled={!!action} aria-label="Save candidate"><Bookmark size={15} /></Button><Button size="sm" variant="ghost" onClick={() => feedback(candidate, 'NOT_RELEVANT')} disabled={!!action} aria-label="Not relevant"><X size={15} /></Button></div></CardContent></Card>; })}</div>}
  </div>;
}
