import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { projectService } from '@/services/projectService';
import { apiService } from '@/services/api';

const MOCK_PROJECTS = [
  { id: 'mock-1', title: 'AI Study Planner', description: 'An easier way to turn a syllabus into a focused study plan.', techStack: ['React', 'Python', 'FastAPI'], status: 'RECRUITING', currentTeamSize: 2, maxTeamSize: 4, categoryName: 'Productivity' },
  { id: 'mock-2', title: 'Campus Market', description: 'A trusted student marketplace for books, tools, and essentials.', techStack: ['Next.js', 'Node.js', 'PostgreSQL'], status: 'RECRUITING', currentTeamSize: 1, maxTeamSize: 3, categoryName: 'Community' },
  { id: 'mock-3', title: 'EcoTrack IoT', description: 'Making energy use visible across student housing.', techStack: ['C++', 'MQTT', 'Analytics'], status: 'RECRUITING', currentTeamSize: 3, maxTeamSize: 5, categoryName: 'Climate' },
  { id: 'mock-4', title: 'Study Circle', description: 'A peer-learning space for sharing notes, goals, and progress.', techStack: ['React', 'Firebase', 'UX Research'], status: 'RECRUITING', currentTeamSize: 2, maxTeamSize: 4, categoryName: 'Education' },
  { id: 'mock-5', title: 'Local Lens', description: 'Helping students discover useful places, events, and communities nearby.', techStack: ['Flutter', 'Maps', 'Design'], status: 'IN_PROGRESS', currentTeamSize: 3, maxTeamSize: 5, categoryName: 'Campus Life' },
];

const JOURNEY = [
  ['01', 'Find a project', 'Browse ideas from students who are ready to build.'],
  ['02', 'Find your people', 'Match the skills and interests your project needs.'],
  ['03', 'Make progress', 'Keep conversations, tasks, and responsibilities together.'],
  ['04', 'Show your work', 'Turn your contribution into something worth sharing.'],
];

const QUESTIONS = [
  ['What is Quasar?', 'Quasar is a collaboration platform for students who want to discover projects, find teammates, manage work, and showcase what they build.'],
  ['Do I need a project idea to join?', 'No. You can explore projects and find a team first, or create your own project when you have an idea ready.'],
  ['How does teammate matching work?', 'Quasar compares project needs with student skills to surface relevant projects, skill gaps, and potential teammates.'],
];

function StatusNotice({ status, elapsed }) {
  if (status === 'live-notified') return null;
  const live = status === 'live';
  const startupSeconds = 35;
  const remaining = Math.max(startupSeconds - Math.min(elapsed, startupSeconds), 0);
  const progress = live ? 100 : Math.min((elapsed / startupSeconds) * 100, 100);
  return (
      <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-[#d9d1c4] bg-white/95 p-4 shadow-[0_20px_60px_rgba(47,42,35,0.16)] backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-[#0f172a]">{live ? 'Live workspace connected' : 'Preview mode is ready'}</p>
            <p className="mt-1 text-xs leading-5 text-[#64748b]">{live ? 'Recent projects are now connected to Quasar.' : remaining ? `Preparing live project data. You can explore the preview while we connect · ${remaining}s.` : 'The live feed is taking longer than expected. The preview remains available while we reconnect.'}</p>
          </div>
          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${live ? 'bg-[#4f8a6d]' : 'animate-pulse bg-[#b77946]'}`} />
        </div>
        {!live && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f1f5f9]"><motion.div className="h-full rounded-full bg-[#b77946]" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} /></div>}
      </div>
  );
}

function ProjectCard({ project, index, onOpen }) {
  const accents = ['bg-emerald-50', 'bg-orange-50', 'bg-slate-50', 'bg-teal-50', 'bg-stone-50'];
  const lead = project.lead || {};
  const leadName = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'Project lead';
  const status = String(project.status || 'RECRUITING').replaceAll('_', ' ');
  const skills = Array.isArray(project.skillsRequired) ? project.skillsRequired : [];
  const memberImages = Array.isArray(project.memberProfileImageUrls) ? project.memberProfileImageUrls : [];
  return (
      <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} role="button" tabIndex={0} onClick={onOpen} onKeyDown={event => event.key === 'Enter' && onOpen()} className="group w-[300px] shrink-0 cursor-pointer overflow-hidden rounded-[24px] border border-slate-200 bg-white text-left transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.14)] sm:w-[340px]">
        <div className={`relative min-h-[124px] ${accents[index % accents.length]} p-5`}><span className="absolute right-5 top-5 rounded-full bg-white/80 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-600">{project.categoryName || 'Student project'}</span><div className="absolute bottom-5 left-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600"><span className={`h-2 w-2 rounded-full ${status === 'RECRUITING' ? 'bg-emerald-600' : 'bg-amber-500'}`} /> {status}</div></div>
        <div className="p-5"><h3 className="text-lg font-black tracking-[-0.03em] text-slate-900">{project.title}</h3><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div className="rounded-xl bg-slate-50 p-3"><p className="font-bold text-slate-400">Team</p><p className="mt-1 font-black text-slate-700">{project.currentTeamSize ?? 0} / {project.maxTeamSize ?? 0} members</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="font-bold text-slate-400">Lead</p><p className="mt-1 truncate font-black text-slate-700">{leadName}</p></div></div><div className="mt-4"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Skills needed</p>{skills.length ? <div className="mt-2 flex flex-wrap gap-1.5">{skills.map(skill => <span key={skill} className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-800">{skill}</span>)}</div> : <p className="mt-2 text-xs text-slate-400">Open to contributors with relevant skills</p>}</div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-500"><span>{lead.branch || 'Student-led project'}</span><span className="text-teal-700 transition group-hover:translate-x-1">View project →</span></div>{memberImages.length > 0 && <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-400"><div className="flex -space-x-2">{memberImages.slice(0, 4).map((url, imageIndex) => <img key={`${url}-${imageIndex}`} src={url} alt="Project member" className="h-6 w-6 rounded-full border-2 border-white object-cover" />)}</div>{memberImages.length} team profile{memberImages.length === 1 ? '' : 's'}</div>}</div>
      </motion.article>
  );
}
function WorkspacePanel({ active }) {
  const panels = {
    discover: { label: 'Find projects', heading: 'A clearer way to find your next project.', copy: 'Search ideas by skills, interests, and status. Quasar also recommends projects that are similar to what you know and want to learn.', accent: 'bg-[#eef8f5]' },
    connect: { label: 'Build your team', heading: 'Build a team around what is missing.', copy: 'Check your project skill gaps, see recommended students, and invite the people who can move the idea forward.', accent: 'bg-[#fff7ed]' },
    collaborate: { label: 'Work together', heading: 'Keep the work visible from day one.', copy: 'Manage tasks, chat with teammates, and keep the project story together as the work moves forward.', accent: 'bg-[#f5f7fb]' },
  };
  const panel = panels[active];
  const preview = active === 'discover' ? (
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"><span className="text-xs text-slate-400">⌕</span><span className="text-[11px] text-slate-400">Search projects or skills...</span></div>
        <div className="flex gap-2"><span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-white">Recommended</span><span className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500">Recruiting</span></div>
        {['Research Tool', 'Campus Market'].map((title, index) => <div key={title} className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-start justify-between"><div><p className="text-xs font-black text-slate-900">{title}</p><p className="mt-1 text-[10px] text-slate-500">{index ? 'Community · 1/4 members' : 'Data · 2/4 members'}</p></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">{index ? '92% fit' : 'Hiring'}</span></div><div className="mt-3 flex gap-1.5"><span className="rounded bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">React</span><span className="rounded bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">APIs</span></div></div>)}
      </div>
  ) : active === 'connect' ? (
      <div className="space-y-3">
        <div className="flex items-center justify-between"><p className="text-xs font-black text-slate-900">Project skill coverage</p><span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">2 gaps</span></div>
        <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Covered</p><div className="mt-2 flex gap-2"><span className="rounded bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">React</span><span className="rounded bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">Node.js</span></div><p className="mt-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Still needed</p><div className="mt-2 flex gap-2"><span className="rounded bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">UI/UX</span><span className="rounded bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">Analytics</span></div></div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-xs font-black text-teal-700">A</div><div className="flex-1"><p className="text-xs font-black text-slate-900">Alex Chen</p><p className="text-[10px] text-slate-500">UI/UX · 94% skill match</p></div><span className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-[9px] font-bold text-white">Invite</span></div>
      </div>
  ) : (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-center justify-between"><p className="text-xs font-black text-slate-900">Tasks</p><span className="text-[9px] font-bold text-slate-400">3 open</span></div><div className="mt-3 space-y-2"><div className="rounded-lg bg-amber-50 p-2"><p className="text-[10px] font-bold text-slate-700">Design landing page</p><p className="mt-1 text-[9px] text-amber-700">In progress</p></div><div className="rounded-lg bg-slate-50 p-2"><p className="text-[10px] font-bold text-slate-700">Review API</p><p className="mt-1 text-[9px] text-slate-400">To do</p></div></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-xs font-black text-slate-900">Team chat</p><div className="mt-3 space-y-2"><p className="rounded-lg bg-slate-50 p-2 text-[10px] text-slate-600">Sarah: API is ready for review.</p><p className="rounded-lg bg-teal-50 p-2 text-[10px] text-teal-800">You: I will check it today.</p></div></div>
      </div>
  );
  return <div className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-center"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0f766e]">{panel.label}</p><h3 className="mt-3 text-2xl font-black leading-tight tracking-[-0.03em] text-[#0f172a] sm:text-3xl">{panel.heading}</h3><p className="mt-4 max-w-lg text-sm leading-6 text-[#64748b]">{panel.copy}</p><div className="mt-6 space-y-2.5"><p className="flex items-center gap-3 text-xs font-bold text-[#334155]"><span className="h-1.5 w-1.5 rounded-full bg-[#0f766e]" /> Built for student teams</p><p className="flex items-center gap-3 text-xs font-bold text-[#334155]"><span className="h-1.5 w-1.5 rounded-full bg-[#b77946]" /> Clear next steps, less noise</p></div></div><div className={`relative min-h-[300px] overflow-hidden rounded-[24px] border border-[#e2e8f0] ${panel.accent} p-4 shadow-[0_18px_50px_rgba(68,58,45,0.08)] sm:p-5`}><div className="mb-5 flex items-center justify-between border-b border-slate-200/80 pb-3"><div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-[#8bb8a9]" /><span className="h-2 w-2 rounded-full bg-[#dcccaa]" /><span className="h-2 w-2 rounded-full bg-[#8bb8a9]" /></div><span className="text-[9px] font-bold text-slate-400">quasar / {active}</span></div>{preview}</div></div>;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [serverStatus, setServerStatus] = useState('warming');
  const [elapsed, setElapsed] = useState(0);
  const [activeWorkspace, setActiveWorkspace] = useState('discover');
  const [openQuestion, setOpenQuestion] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const projectsRef = useRef(null);
  const pollRef = useRef(null);
  const startRef = useRef(Date.now());
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchRecentProjects = async () => {
      try {
        const response = await projectService.getRecentProjects();
        const envelope = response?.data ?? response;
        const body = envelope?.data ?? envelope;
        const recent = Array.isArray(body) ? body : body?.content || [];
        if (mounted && recent.length) setProjects(recent.slice(0, 10));
      } catch (_) {
        // Keep the mock preview visible while the backend is unavailable.
      }
    };
    const attemptSilentLogin = async () => {
      const token = apiService.getToken();
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, { headers: apiService.getHeaders(true) });
        if (response.ok) navigate('/dashboard');
        else apiService.clearSession();
      } catch (_) {
        // Do not interrupt a guest landing-page visit on a transient network error.
      }
    };
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) return;
        setServerStatus('live');
        if (pollRef.current) clearInterval(pollRef.current);
        await fetchRecentProjects();
        await attemptSilentLogin();
        setTimeout(() => mounted && setServerStatus('live-notified'), 5000);
      } catch (_) {
        setServerStatus('warming');
      }
    };
    checkHealth();
    pollRef.current = setInterval(checkHealth, 3000);
    return () => { mounted = false; if (pollRef.current) clearInterval(pollRef.current); };
  }, [API_BASE_URL, navigate]);

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const carouselProjects = projects.slice(0, 10);
  const marqueeProjects = [...carouselProjects, ...carouselProjects];

  return (
      <div className="min-h-screen overflow-x-hidden bg-[#ffffff] text-[#0f172a] selection:bg-[#d1fae5] selection:text-[#0f172a]">
        <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#e2e8f0]/80 bg-[#ffffff]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><Link to="/" className="flex items-center gap-3"><img src="/Logo.png" alt="Quasar" className="h-9 w-9 rounded-xl object-cover" /><span className="text-lg font-black tracking-[-0.04em]">quasar<span className="text-[#0f766e]">.</span></span></Link><div className="hidden items-center gap-8 md:flex"><button onClick={() => scrollTo('experience')} className="text-sm font-bold text-[#64748b] hover:text-[#0f172a]">Experience</button><button onClick={() => scrollTo('workspace')} className="text-sm font-bold text-[#64748b] hover:text-[#0f172a]">Workspace</button><button onClick={() => scrollTo('projects')} className="text-sm font-bold text-[#64748b] hover:text-[#0f172a]">Projects</button><button onClick={() => scrollTo('questions')} className="text-sm font-bold text-[#64748b] hover:text-[#0f172a]">Questions</button></div><div className="hidden items-center gap-3 md:flex"><Link to="/login" className="px-3 py-2 text-sm font-bold text-[#64748b] hover:text-[#0f172a]">Sign in</Link><Link to="/register" className="rounded-full bg-[#0f172a] px-5 py-2.5 text-sm font-black text-[#ffffff] transition hover:bg-[#0f766e]">Join Quasar <span className="ml-1">→</span></Link></div><button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm font-black md:hidden" aria-label="Open menu">{mobileOpen ? 'Close' : 'Menu'}</button></div>{mobileOpen && <div className="border-t border-[#e2e8f0] bg-[#ffffff] px-5 py-4 md:hidden"><div className="flex flex-col gap-3"><button onClick={() => { scrollTo('experience'); setMobileOpen(false); }} className="py-2 text-left text-sm font-bold text-[#64748b]">Experience</button><button onClick={() => { scrollTo('workspace'); setMobileOpen(false); }} className="py-2 text-left text-sm font-bold text-[#64748b]">Workspace</button><Link to="/login" className="py-2 text-sm font-bold text-[#64748b]">Sign in</Link><Link to="/register" className="rounded-full bg-[#0f172a] px-4 py-3 text-center text-sm font-black text-white">Join Quasar</Link></div></div>}</nav>

        <main>
          <section className="relative px-5 pb-16 pt-28 lg:px-8 lg:pb-20 lg:pt-36"><div className="pointer-events-none absolute right-[-8%] top-20 h-[500px] w-[500px] rounded-full bg-[#f1f5f9] blur-3xl" /><div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20"><div><h1 className="mt-7 max-w-3xl font-serif text-4xl font-bold leading-[0.98] tracking-[-0.055em] text-[#0f172a] sm:text-5xl lg:text-6xl">Find the people behind your next <em className="font-normal text-[#0f766e]">great project.</em></h1><p className="mt-7 max-w-xl text-lg leading-8 text-[#64748b]">Quasar brings student ideas, skills, and momentum into one thoughtful place—from the first discovery to the final showcase.</p><p className="mt-7 max-w-lg text-sm font-bold leading-6 text-[#334155]">Discover projects, understand the team fit, and see how Quasar helps students build together from the first conversation to the final result.</p><p className="mt-8 text-xs font-bold text-[#94a3b8]">{serverStatus === 'live' || serverStatus === 'live-notified' ? 'Connected to live project data' : 'Previewing the Quasar experience while the workspace connects'}</p></div><div className="relative"><div className="relative rounded-[34px] border border-[#cbd5e1] bg-[#ffffff] p-3 shadow-[0_30px_90px_rgba(68,58,45,0.13)]"><div className="rounded-[26px] bg-[#0f172a] p-6 text-[#ffffff] sm:p-8"><div className="flex items-end justify-between border-b border-white/15 pb-6"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8bb8a9]">A project taking shape</p><h2 className="mt-3 font-serif text-2xl font-bold">Research Tool</h2></div><span className="rounded-full border border-[#8bb8a9]/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#8bb8a9]">Recruiting</span></div><div className="grid gap-3 py-6 sm:grid-cols-2"><div className="rounded-2xl bg-white/10 p-4"><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8bb8a9]">Looking for</p><p className="mt-4 text-lg font-black">A curious team</p><p className="mt-2 text-xs leading-5 text-white/55">People who want to learn by building something useful.</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8bb8a9]">Skills in the room</p><div className="mt-4 space-y-2 text-xs font-bold text-white/80"><p>Python <span className="float-right text-[#8bb8a9]">Covered</span></p><p>Data Analysis <span className="float-right text-[#8bb8a9]">Needed</span></p><p>Product Design <span className="float-right text-[#8bb8a9]">Needed</span></p></div></div></div><div className="flex items-center justify-between border-t border-white/15 pt-5"><span className="text-xs font-bold text-white/55">2 of 4 places filled</span><span className="text-sm font-black text-[#8bb8a9]">See the full brief →</span></div></div></div><div className="absolute -bottom-6 -left-5 rounded-2xl border border-[#cbd5e1] bg-[#ffffff] px-4 py-3 shadow-xl"><p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#0f766e]">A small step</p><p className="mt-1 text-xs font-bold text-[#334155]">Find your place on the team.</p></div></div></div></section>

          <section className="border-y border-[#e2e8f0] bg-[#ffffff] px-5 py-8 lg:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5"><div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-black text-[#334155]"><span>Discover</span><span className="text-[#cbd5e1]">→</span><span>Connect</span><span className="text-[#cbd5e1]">→</span><span>Collaborate</span><span className="text-[#cbd5e1]">→</span><span>Showcase</span></div></div></section>

          <section id="experience" className="scroll-mt-24 px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><h2 className="mt-5 font-serif text-2xl font-bold leading-tight tracking-[-0.04em] text-[#0f172a] sm:text-4xl">A clearer path from idea to impact.</h2><p className="mt-4 text-base leading-7 text-[#64748b]">Quasar is designed around the moments that make student collaboration work better.</p></div><div className="mt-14 grid gap-px overflow-hidden rounded-[28px] border border-[#e2e8f0] bg-[#e2e8f0] md:grid-cols-2 lg:grid-cols-4">{JOURNEY.map(([number, title, copy], index) => <button key={number} onClick={() => { setActiveWorkspace(index === 0 ? 'discover' : index === 1 ? 'connect' : 'collaborate'); scrollTo('workspace'); }} className="group bg-[#ffffff] p-7 text-left transition hover:bg-[#f0fdf4] lg:p-8"><p className="text-xs font-black text-[#0f766e]">{number}</p><div className="mt-16 h-px w-8 bg-[#b77946] transition-all group-hover:w-16" /><h3 className="mt-6 text-lg font-black text-[#0f172a]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#64748b]">{copy}</p><span className="mt-7 block text-xs font-black text-[#0f766e] opacity-0 transition group-hover:opacity-100">Explore this step →</span></button>)}</div></div></section>

          <section id="workspace" className="scroll-mt-24 bg-[#f8fafc] px-5 py-16 lg:px-8 lg:py-20"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-8"><div><h2 className="mt-5 font-serif text-2xl font-bold leading-tight tracking-[-0.04em] text-[#0f172a] sm:text-4xl">The right structure keeps people moving.</h2></div><p className="max-w-md text-base leading-7 text-[#64748b]">Choose a part of the journey to see how Quasar turns a loose idea into a team with direction.</p></div><div className="mt-10 flex flex-wrap gap-2 border-b border-[#cbd5e1] pb-4">{[['discover', 'Find projects'], ['connect', 'Build your team'], ['collaborate', 'Work together']].map(([key, label]) => <button key={key} onClick={() => setActiveWorkspace(key)} className={`rounded-full px-4 py-2.5 text-xs font-black transition ${activeWorkspace === key ? 'bg-[#0f172a] text-[#ffffff]' : 'text-[#64748b] hover:bg-[#ffffff]'}`}>{label}</button>)}</div><AnimatePresence mode="wait"><motion.div key={activeWorkspace} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="mt-9"><WorkspacePanel active={activeWorkspace} /></motion.div></AnimatePresence><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><div className="rounded-xl border border-[#e2e8f0] bg-white p-4"><p className="text-xs font-black text-[#0f172a]">Task management</p><p className="mt-2 text-xs leading-5 text-[#64748b]">Move work from to-do to in progress to completed.</p></div><div className="rounded-xl border border-[#e2e8f0] bg-white p-4"><p className="text-xs font-black text-[#0f172a]">Live team chat</p><p className="mt-2 text-xs leading-5 text-[#64748b]">Keep project conversations close to the work.</p></div><div className="rounded-xl border border-[#e2e8f0] bg-white p-4"><p className="text-xs font-black text-[#0f172a]">Skill gap check</p><p className="mt-2 text-xs leading-5 text-[#64748b]">See which skills your team still needs.</p></div><div className="rounded-xl border border-[#e2e8f0] bg-white p-4"><p className="text-xs font-black text-[#0f172a]">Project recommendations</p><p className="mt-2 text-xs leading-5 text-[#64748b]">Find projects that fit a student’s skills.</p></div><div className="rounded-xl border border-[#e2e8f0] bg-white p-4"><p className="text-xs font-black text-[#0f172a]">Student recommendations</p><p className="mt-2 text-xs leading-5 text-[#64748b]">Find teammates through skill similarity.</p></div></div></div></section>

          <section id="projects" className="scroll-mt-24 px-5 py-16 lg:px-8 lg:py-20"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-6"><div className="max-w-2xl"><h2 className="mt-5 font-serif text-2xl font-bold leading-tight tracking-[-0.04em] text-[#0f172a] sm:text-4xl">There is always something worth joining.</h2><p className="mt-4 text-base leading-7 text-[#64748b]">Explore the latest opportunities from the Quasar community and find the one that gives your skills somewhere to go.</p></div><Link to="/discover/projects" className="text-sm font-black text-[#0f766e] hover:text-[#115e59]">See all projects →</Link></div><div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${serverStatus === 'warming' ? 'animate-pulse bg-amber-500' : 'bg-emerald-600'}`} /><p className="text-sm font-bold text-slate-700">{serverStatus === 'warming' ? 'The latest projects are on their way.' : 'Live project feed connected.'}</p></div>{serverStatus === 'warming' ? <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100"><motion.div className="h-full rounded-full bg-teal-600" animate={{ width: `${Math.min((elapsed / 35) * 100, 100)}%` }} /></div> : <span className="text-xs font-bold text-emerald-700">Showing recent community projects</span>}</div><div ref={projectsRef} className="relative mt-6 overflow-hidden py-3" onMouseEnter={() => setCarouselPaused(true)} onMouseLeave={() => setCarouselPaused(false)} onFocus={() => setCarouselPaused(true)} onBlur={() => setCarouselPaused(false)}><div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" /><div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" /><div className="landing-project-marquee flex w-max gap-5" style={{ animationPlayState: carouselPaused ? 'paused' : 'running' }}>{marqueeProjects.map((project, index) => <ProjectCard key={`${project.id}-${index}`} project={project} index={index % carouselProjects.length} onOpen={() => navigate('/discover/projects')} />)}</div></div><p className="mt-6 text-xs font-bold text-[#94a3b8]">{serverStatus === 'warming' ? 'Preview projects remain available while live data connects.' : `Showing ${projects.length} recent projects from the Quasar workspace.`} Hover over a project to pause and inspect it.</p></div></section>

          <section className="bg-[#0f172a] px-5 py-16 text-[#ffffff] lg:px-8 lg:py-20"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><div><h2 className="mt-4 font-serif text-2xl font-bold leading-tight tracking-[-0.04em] sm:text-3xl">Do not build alone when the right people are looking too.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/60">Whether you have an idea, a skill, or simply the desire to learn, Quasar gives you a more thoughtful way to begin.</p><Link to="/register" className="mt-6 inline-block rounded-full bg-[#ffffff] px-5 py-3 text-xs font-black text-[#0f172a] transition hover:bg-[#d1fae5]">Join the community →</Link></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/15 p-5"><p className="text-2xl font-black text-[#8bb8a9]">01</p><p className="mt-8 text-sm font-black">Find meaningful work</p><p className="mt-2 text-xs leading-5 text-white/50">Choose projects that connect to your interests and goals.</p></div><div className="rounded-2xl border border-white/15 p-5"><p className="text-2xl font-black text-[#8bb8a9]">02</p><p className="mt-8 text-sm font-black">Meet complementary people</p><p className="mt-2 text-xs leading-5 text-white/50">Build teams around what each person brings next.</p></div><div className="rounded-2xl border border-white/15 p-5 sm:col-span-2"><p className="text-2xl font-black text-[#b77946]">03</p><p className="mt-4 text-sm font-black">Leave with proof of what you did</p><p className="mt-2 max-w-xl text-xs leading-5 text-white/50">Keep the project story, your contribution, and the finished work connected.</p></div></div></div></section>

          <section id="questions" className="scroll-mt-24 px-5 py-16 lg:px-8 lg:py-20"><div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.7fr_1.3fr]"><div><h2 className="mt-5 font-serif text-2xl font-bold leading-tight tracking-[-0.04em] text-[#0f172a]">Start where you are.</h2><p className="mt-4 text-sm leading-6 text-[#64748b]">Bring an idea, a skill, or curiosity. Quasar gives you a useful next step.</p></div><div className="divide-y divide-[#e2e8f0] border-y border-[#e2e8f0]">{QUESTIONS.map(([question, answer], index) => <div key={question}><button onClick={() => setOpenQuestion(openQuestion === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-black text-[#0f172a]"><span>{question}</span><span className={`text-xl font-normal text-[#0f766e] transition ${openQuestion === index ? 'rotate-45' : ''}`}>+</span></button>{openQuestion === index && <p className="pb-4 text-sm leading-6 text-[#64748b]">{answer}</p>}</div>)}</div></div></section>

          <section className="px-5 pb-16 lg:px-8 lg:pb-20"><div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[24px] bg-[#e7f5ed] px-6 py-9 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:py-11"><div><h2 className="mt-2 max-w-2xl font-serif text-3xl font-bold tracking-[-0.04em] text-[#0f172a]">Find your place on the team.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#5b665c]">Meet people who complement your skills and start building something worth showing.</p></div><Link to="/register" className="rounded-full border border-[#94b8a1] px-5 py-3 text-center text-xs font-black text-[#0f172a]">Create account</Link></div></section>
        </main>

        <StatusNotice status={serverStatus} elapsed={elapsed} />

        <style>{`@keyframes landing-project-marquee { from { transform: translateX(0); } to { transform: translateX(calc(-50% - 10px)); } } .landing-project-marquee { animation: landing-project-marquee 70s linear infinite; } @media (prefers-reduced-motion: reduce) { .landing-project-marquee { animation: none; } }`}</style>

        <footer className="border-t border-[#e2e8f0] bg-[#ffffff] px-5 py-8 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><Link to="/" className="flex items-center gap-2"><img src="/Logo.png" alt="Quasar" className="h-7 w-7 rounded-lg" /><span className="text-sm font-black">quasar<span className="text-[#0f766e]">.</span></span></Link><div><p className="text-xs font-medium text-[#94a3b8]">Find your team. Build your project. Showcase your work.</p><p className="mt-2 text-xs font-black text-[#334155]">Developed by Vignesh.</p></div><div className="flex gap-4 text-xs font-bold text-[#64748b]"><Link to="/login" className="hover:text-[#0f766e]">Sign in</Link><Link to="/register" className="hover:text-[#0f766e]">Create account</Link></div></div></footer>
      </div>
  );
}
