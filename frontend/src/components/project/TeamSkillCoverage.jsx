import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Loader2, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';
import skillInsightsService from '@/services/skillInsightsService';

const statusStyles = {
    COVERED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    PARTIALLY_COVERED: 'border-amber-200 bg-amber-50 text-amber-700',
    NOT_LISTED: 'border-rose-200 bg-rose-50 text-rose-700',
    UNKNOWN: 'border-slate-200 bg-slate-100 text-slate-600',
};
const statusText = { COVERED: 'Covered', PARTIALLY_COVERED: 'Partially covered', NOT_LISTED: 'Not listed', UNKNOWN: 'Unknown' };
const levelText = value => String(value || 'Not provided').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

export default function TeamSkillCoverage({ projectId }) {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});

    const load = async () => {
        try { setLoading(true); setAnalysis(await skillInsightsService.getProjectAnalysis(projectId)); }
        catch (error) { toast.error(error.message || 'Unable to load team skill coverage'); }
        finally { setLoading(false); }
    };
    useEffect(() => { if (projectId) load(); }, [projectId]);

    if (loading) return <Card className="border-slate-200 bg-white"><CardContent className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-indigo-600" /></CardContent></Card>;
    if (!analysis) return null;
    const skills = analysis.requiredSkills || [];

    return <Card className="border-slate-200 bg-white shadow-sm rounded-2xl"><CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="flex items-center gap-2 text-base font-black text-slate-900"><Users size={18} className="text-indigo-600" /> Team skill coverage</CardTitle><p className="mt-1 text-xs text-slate-500">This compares required skills with the current team profiles. Roles and open seats are separate.</p></div><Button variant="outline" size="sm" onClick={load} className="w-fit gap-2 rounded-lg text-xs font-bold"><RefreshCw size={13} /> Refresh</Button></div><div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4"><div className="rounded-lg bg-slate-50 p-3"><p className="text-lg font-black text-slate-900">{analysis.requiredSkillCount ?? 0}</p><p className="text-[10px] font-bold uppercase text-slate-400">Required</p></div><div className="rounded-lg bg-emerald-50 p-3"><p className="text-lg font-black text-emerald-700">{analysis.coveredSkillCount ?? 0}</p><p className="text-[10px] font-bold uppercase text-emerald-600">Covered</p></div><div className="rounded-lg bg-amber-50 p-3"><p className="text-lg font-black text-amber-700">{analysis.partiallyCoveredSkillCount ?? 0}</p><p className="text-[10px] font-bold uppercase text-amber-600">Partial</p></div><div className="rounded-lg bg-rose-50 p-3"><p className="text-lg font-black text-rose-700">{(analysis.notListedSkillCount ?? 0) + (analysis.unknownSkillCount ?? 0)}</p><p className="text-[10px] font-bold uppercase text-rose-600">Needs review</p></div></div></CardHeader><CardContent className="space-y-3">{skills.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center"><p className="text-sm font-bold text-slate-700">No required skills added</p><p className="mt-1 text-xs text-slate-500">Add required skills in Project Settings to see coverage.</p></div> : skills.map((skill, index) => { const key = skill.skillId || `${skill.skillName}-${index}`; const isOpen = expanded[key]; return <div key={key} className="rounded-xl border border-slate-200 bg-white"><button type="button" onClick={() => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))} className="flex w-full items-center justify-between gap-3 p-4 text-left"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-black text-slate-900">{skill.skillName}</span><Badge className={`border ${statusStyles[skill.coverageStatus] || statusStyles.UNKNOWN}`}>{statusText[skill.coverageStatus] || 'Unknown'}</Badge></div><p className="mt-1 text-xs text-slate-500">{skill.category || 'General'}{skill.requiredLevel ? ` · Required: ${levelText(skill.requiredLevel)}` : ' · No required level specified'}</p></div>{isOpen ? <ChevronUp size={16} className="shrink-0 text-slate-400" /> : <ChevronDown size={16} className="shrink-0 text-slate-400" />}</button><div className="border-t border-slate-100 px-4 pb-4 pt-3"><p className="text-xs leading-relaxed text-slate-500">{skill.coverageNote || 'No additional coverage note was provided.'}</p><div className="mt-2 flex gap-3 text-[11px] font-bold text-slate-500"><span>{skill.membersListingSkill ?? 0} listing</span><span>{skill.membersMeetingRequiredLevel ?? 0} meeting level</span></div>{isOpen && <div className="mt-4 space-y-2">{(skill.memberEvidence || []).length ? skill.memberEvidence.map(member => <div key={member.userId} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"><div><p className="text-xs font-bold text-slate-800">{member.displayName || 'Team member'} {member.projectLead && <span className="ml-1 text-[10px] font-bold text-indigo-600">Lead</span>}</p><p className="mt-1 text-[11px] text-slate-500">Profile level: {levelText(member.profileLevel)}</p></div><Badge className={member.meetsRequiredLevel === true ? 'border-none bg-emerald-50 text-emerald-700' : member.meetsRequiredLevel === false ? 'border-none bg-amber-50 text-amber-700' : 'border-none bg-slate-200 text-slate-600'}>{member.meetsRequiredLevel === true ? 'Meets level' : member.meetsRequiredLevel === false ? 'Below level' : 'Level unknown'}</Badge></div>) : <p className="text-xs text-slate-400">No team profile evidence was returned for this skill.</p>}</div>}</div></div>; })}</CardContent></Card>;
}
