import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, TrendingUp, Users, ArrowRight, RefreshCw, BookOpen, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import skillInsightsService from '@/services/skillInsightsService';
import skillsService from '@/services/skillsService';

const unwrapList = (value) => Array.isArray(value) ? value : value?.content || [];
const label = value => String(value || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

function Metric({ value, title, detail }) {
    return <Card className="border-slate-200 bg-white shadow-sm rounded-2xl"><CardContent className="p-5"><p className="text-3xl font-black text-slate-900">{value ?? 0}</p><p className="mt-1 text-sm font-bold text-slate-700">{title}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></CardContent></Card>;
}

function SkillDemandCard({ skill, missing = false }) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-black text-slate-900">{skill.skillName || 'Unnamed skill'}</h3><p className="mt-1 text-xs font-semibold text-slate-400">{skill.category || 'General'}</p></div><Badge className={missing ? 'border-none bg-amber-50 text-amber-700' : 'border-none bg-indigo-50 text-indigo-700'}>{skill.activeProjectCount ?? 0} active projects</Badge></div><div className="mt-4 flex gap-3 text-[11px] font-bold text-slate-500"><span>{skill.recruitingProjectCount ?? 0} recruiting</span><span>{skill.inProgressProjectCount ?? 0} in progress</span></div></div>;
}

export default function SkillsInsightsPage({ embedded = false }) {
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState(null);
    const [demand, setDemand] = useState({ content: [], totalPages: 0, totalElements: 0 });
    const [categories, setCategories] = useState([]);
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [demandLoading, setDemandLoading] = useState(true);
    const [error, setError] = useState('');

    const loadAnalysis = async () => {
        try { setLoading(true); setError(''); setAnalysis(await skillInsightsService.getMyAnalysis()); }
        catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };
    const loadDemand = async () => {
        try {
            setDemandLoading(true);
            const result = await skillInsightsService.getDemand({ category, query, page, size: 20 });
            const content = unwrapList(result);
            setDemand({ ...result, content, totalPages: result?.totalPages ?? (content.length ? 1 : 0), totalElements: result?.totalElements ?? content.length });
        } catch (err) { toast.error(err.message); }
        finally { setDemandLoading(false); }
    };

    useEffect(() => { loadAnalysis(); }, []);
    useEffect(() => {
        skillsService.getDiscoveryCategories().then(result => {
            const body = result?.data ?? result;
            const values = Array.isArray(body) ? body : body?.content || Object.keys(body || {});
            setCategories(values.map(item => typeof item === 'string' ? item : item.name || item.category).filter(Boolean));
        }).catch(() => { });
    }, []);
    useEffect(() => { loadDemand(); }, [category, page]);

    const profileSkills = useMemo(() => analysis?.profileSkills || [], [analysis]);
    const missingSkills = useMemo(() => analysis?.highDemandSkillsNotOnProfile || [], [analysis]);
    const recommendedProjects = useMemo(() => analysis?.recommendedProjects || [], [analysis]);

    return <div className={`${embedded ? '' : 'min-h-screen '}bg-slate-50/50 pb-20`}>{!embedded && <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-5 backdrop-blur-md lg:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><div><h1 className="text-xl font-black tracking-tight text-slate-900">Skills Insights</h1><p className="mt-1 text-xs font-semibold text-slate-500">See where your skills are useful and what teams are looking for.</p></div><Button variant="outline" onClick={() => { loadAnalysis(); loadDemand(); }} className="gap-2 rounded-xl border-slate-200 text-xs font-bold"><RefreshCw size={14} /> Refresh</Button></div></header>}
        <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-8">
            {error && <Card className="border-rose-200 bg-white"><CardContent className="flex items-center justify-between gap-4 p-5"><p className="text-sm font-semibold text-rose-700">{error}</p><Button size="sm" onClick={loadAnalysis}>Try again</Button></CardContent></Card>}
            <section><div className="mb-4 flex items-end justify-between"><div><h2 className="text-lg font-black text-slate-900">Your skill snapshot</h2><p className="mt-1 text-xs text-slate-500">Demand counts are based on active recruiting and in-progress projects.</p></div><Button variant="outline" onClick={() => navigate('/skills')} className="gap-2 rounded-xl text-xs font-bold"><BookOpen size={14} /> Edit skills</Button></div>{loading ? <div className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-28 rounded-2xl" /></div> : <div className="grid gap-4 sm:grid-cols-3"><Metric value={analysis?.profileSkillCount} title="Skills on your profile" detail="Keep your profile current" /><Metric value={analysis?.profileSkillsInDemandCount} title="Skills currently in demand" detail="Used by active projects" /><Metric value={analysis?.recommendedProjects?.length} title="Project matches" detail="Top matches from Quasar" /></div>}</section>
            <section className="grid gap-6 lg:grid-cols-2"><Card className="border-slate-200 bg-white shadow-sm rounded-2xl"><CardHeader><CardTitle className="flex items-center gap-2 text-base font-black text-slate-900"><TrendingUp size={18} className="text-indigo-600" /> Your skills in active projects</CardTitle></CardHeader><CardContent className="space-y-3">{profileSkills.length ? profileSkills.map(skill => <SkillDemandCard key={skill.skillId || skill.skillName} skill={skill} />) : <p className="text-sm text-slate-500">No skills are listed on your profile yet. Add skills to understand your project fit.</p>}</CardContent></Card><Card className="border-slate-200 bg-white shadow-sm rounded-2xl"><CardHeader><CardTitle className="flex items-center gap-2 text-base font-black text-slate-900"><Users size={18} className="text-amber-600" /> Skills teams need</CardTitle></CardHeader><CardContent className="space-y-3">{missingSkills.length ? missingSkills.map(skill => <div key={skill.skillId || skill.skillName} className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4"><div><p className="text-sm font-black text-slate-900">{skill.skillName}</p><p className="mt-1 text-xs text-slate-500">{skill.category || 'General'} · {skill.recruitingProjectCount ?? 0} recruiting projects</p></div><Button size="sm" onClick={() => navigate('/skills')} className="shrink-0 rounded-lg bg-slate-900 text-xs text-white hover:bg-slate-700">Add skill</Button></div>) : <p className="text-sm text-slate-500">No missing high-demand skills were found right now.</p>}</CardContent></Card></section>
            <section><div className="mb-4"><h2 className="text-lg font-black text-slate-900">Recommended projects</h2><p className="mt-1 text-xs text-slate-500">Your recommendations use the same skill scoring system as Explore.</p></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{recommendedProjects.length ? recommendedProjects.map(item => { const project = item.project || item; return <Card key={project.id} className="border-slate-200 bg-white shadow-sm rounded-2xl"><CardContent className="flex h-full flex-col p-5"><div className="flex items-start justify-between gap-3"><h3 className="text-base font-black text-slate-900">{project.title || 'Project match'}</h3><Badge className="border-none bg-emerald-50 text-emerald-700">{item.matchScore != null ? `${item.matchScore}%` : 'Match'}</Badge></div><p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">{project.description || 'A project that may fit your current skills.'}</p><Button variant="outline" onClick={() => navigate('/discover/projects')} className="mt-5 justify-between rounded-xl text-xs font-bold">Explore project <ArrowRight size={14} /></Button></CardContent></Card>; }) : <Card className="border-dashed border-slate-300 bg-white md:col-span-2 lg:col-span-3"><CardContent className="py-12 text-center text-sm text-slate-500">No project matches are available yet. Add or update your skills to improve recommendations.</CardContent></Card>}</div></section>
            <section><div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><h2 className="text-lg font-black text-slate-900">Skills in demand across Quasar</h2><p className="mt-1 text-xs text-slate-500">Counts represent distinct active projects, not students or job openings.</p></div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setPage(0), loadDemand())} placeholder="Search skills" className="h-10 w-full rounded-xl border-slate-200 bg-white pl-9 text-sm sm:w-52" /></div><select value={category} onChange={e => { setCategory(e.target.value); setPage(0); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"><option value="">All categories</option>{categories.map(item => <option key={item} value={item}>{item}</option>)}</select><Button onClick={() => { setPage(0); loadDemand(); }} className="h-10 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-700">Search</Button></div></div><div className="rounded-2xl border border-slate-200 bg-white shadow-sm">{demandLoading ? <div className="space-y-3 p-5"><Skeleton className="h-16 rounded-xl" /><Skeleton className="h-16 rounded-xl" /><Skeleton className="h-16 rounded-xl" /></div> : demand.content.length ? <div className="divide-y divide-slate-100">{demand.content.map(skill => <div key={skill.skillId || skill.skillName} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black text-slate-900">{skill.skillName}</p><p className="mt-1 text-xs font-semibold text-slate-400">{skill.category || 'General'}</p></div><div className="flex gap-4 text-xs font-bold text-slate-500"><span><strong className="text-slate-900">{skill.activeProjectCount ?? 0}</strong> active</span><span><strong className="text-emerald-700">{skill.recruitingProjectCount ?? 0}</strong> recruiting</span><span><strong className="text-indigo-700">{skill.inProgressProjectCount ?? 0}</strong> in progress</span></div></div>)}</div> : <p className="p-10 text-center text-sm text-slate-500">No active project demand matches your filters.</p>}{demand.totalPages > 1 && <div className="flex items-center justify-between border-t border-slate-100 p-4"><Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous</Button><span className="text-xs font-bold text-slate-500">Page {page + 1} of {demand.totalPages}</span><Button variant="outline" size="sm" disabled={page + 1 >= demand.totalPages} onClick={() => setPage(value => value + 1)}>Next</Button></div>}</div></section>
        </main></div>;
}
