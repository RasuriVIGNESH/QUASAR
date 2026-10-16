import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { projectService } from '@/services/projectService';
import { apiService } from '@/services/api';
import {
  ArrowRight, Users, Layers, Briefcase, Search,
  CheckCircle2, Menu, X, Zap, FolderOpen
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_PROJECTS = [
  { id: 'mock-1', title: 'AI Study Planner', description: 'An easier way to turn a syllabus into a focused study plan.', skillsRequired: ['React', 'Python', 'FastAPI'], status: 'RECRUITING', currentTeamSize: 2, maxTeamSize: 4, categoryName: 'Productivity', lead: { firstName: 'Sarah', lastName: 'Jenkins', branch: 'Computer Science' } },
  { id: 'mock-2', title: 'Campus Market', description: 'A trusted student marketplace for books, tools, and essentials.', skillsRequired: ['Next.js', 'Node.js', 'PostgreSQL'], status: 'RECRUITING', currentTeamSize: 1, maxTeamSize: 3, categoryName: 'Community', lead: { firstName: 'Alex', lastName: 'Chen', branch: 'Information Technology' } },
  { id: 'mock-3', title: 'EcoTrack IoT', description: 'Making energy use visible across student housing.', skillsRequired: ['C++', 'MQTT', 'Analytics'], status: 'IN_PROGRESS', currentTeamSize: 3, maxTeamSize: 5, categoryName: 'Climate', lead: { firstName: 'James', lastName: 'Wilson', branch: 'Electrical Engineering' } },
];

// --- STATUS NOTICE ---
function StatusNotice({ status, elapsed }) {
  if (status === 'live-notified') return null;
  const live = status === 'live';
  return (
      <AnimatePresence>
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900">{live ? 'Workspace Connected' : 'Initializing Workspace'}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{live ? 'Recent projects are now loading in real-time.' : 'Showing a small preview while the backend wakes up.'}</p>
            </div>
            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${live ? 'bg-emerald-600' : 'animate-pulse bg-amber-500'}`} />
          </div>
          {!live && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <motion.div className="h-full rounded-full bg-amber-500" animate={{ width: `${Math.min((elapsed / 30) * 100, 100)}%` }} transition={{ duration: 0.5 }} />
              </div>
          )}
        </motion.div>
      </AnimatePresence>
  );
}

// --- PROJECT CARD ---
function ProjectCard({ project, index }) {
  const leadName = [project.lead?.firstName, project.lead?.lastName].filter(Boolean).join(' ') || 'Project Lead';
  const status = String(project.status || 'RECRUITING').replaceAll('_', ' ');
  const skills = Array.isArray(project.skillsRequired) ? project.skillsRequired : [];
  const isRecruiting = status === 'RECRUITING';

  return (
      <motion.article
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          whileHover={{ y: -4 }}
          className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:border-emerald-200"
      >
        <div>
          <div className="flex items-start justify-between">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isRecruiting ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-amber-50 text-amber-800 border-amber-100'}`}>
            {status}
          </span>
            <span className="text-xs font-medium text-slate-500">{project.categoryName || 'General'}</span>
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-tight">
            {project.title}
          </h3>
          <p className="mt-2 text-sm text-slate-500 line-clamp-2">{project.description}</p>

          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Skills Needed</p>
            {skills.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 3).map(skill => (
                      <span key={skill} className="rounded-md bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600 border border-slate-100">
                  {skill}
                </span>
                  ))}
                  {skills.length > 3 && (
                      <span className="rounded-md bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500 border border-slate-100">
                  +{skills.length - 3}
                </span>
                  )}
                </div>
            ) : (
                <p className="text-xs text-slate-400 italic">Open to relevant skills</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 border border-emerald-100">
              {leadName.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-none">{leadName}</p>
              <p className="text-[10px] text-slate-500 mt-1">{project.lead?.branch || 'Student'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg">
            <Users size={14} className="text-slate-500" />
            <span>{project.currentTeamSize ?? 0}/{project.maxTeamSize ?? 0}</span>
          </div>
        </div>
      </motion.article>
  );
}

// --- INTERACTIVE FEATURE MOCKUPS ---
const FeatureMockup = ({ activeTab }) => {
  if (activeTab === 'matching') {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Team Skill Coverage</h4>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-100">2 Gaps Found</span>
          </div>
          <div className="mb-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Covered</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-100">React</span>
              <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-100">Node.js</span>
            </div>
          </div>
          <div className="mb-6">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Missing</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 border border-amber-100">UI/UX Design</span>
              <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 border border-amber-100">Data Analysis</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900">Recommended Match</span>
              <span className="text-xs font-black text-emerald-700">94% Fit</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">A</div>
              <div>
                <p className="text-xs font-bold text-slate-900">Alex Chen</p>
                <p className="text-[10px] text-slate-500">UI/UX · Figma · Prototyping</p>
              </div>
              <button className="ml-auto rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-800 transition-colors">Invite</button>
            </div>
          </div>
        </div>
    );
  }

  if (activeTab === 'workspace') {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Tasks</p>
              <div className="space-y-2">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Design landing page</p>
                  <p className="text-[10px] text-slate-500 mt-1">In Progress · Alex</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-900">Setup database</p>
                  <p className="text-[10px] text-emerald-700 mt-1">Completed · Sarah</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Write API docs</p>
                  <p className="text-[10px] text-slate-500 mt-1">To Do · James</p>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Project Chat</p>
              <div className="space-y-2">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500">Sarah</p>
                  <p className="text-xs text-slate-700 mt-1">API endpoints are ready for review!</p>
                </div>
                <div className="rounded-lg bg-indigo-50 p-3 border border-indigo-100 ml-4">
                  <p className="text-[10px] font-bold text-indigo-500">You</p>
                  <p className="text-xs text-indigo-900 mt-1">Awesome, I'll check the PR now.</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500">Alex</p>
                  <p className="text-xs text-slate-700 mt-1">Just pushed the new hero section.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">Portfolio Entry</span>
          <span className="text-[10px] font-bold text-slate-400">Added 2 days ago</span>
        </div>
        <h4 className="text-lg font-bold text-slate-900 mb-2">Backend API Integration</h4>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">Designed and implemented RESTful endpoints for user authentication and project management. Reduced API response time by 40%.</p>
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600 border border-slate-100">Node.js</span>
          <span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600 border border-slate-100">PostgreSQL</span>
          <span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600 border border-slate-100">REST APIs</span>
        </div>
        <div className="flex gap-4 pt-4 border-t border-slate-100">
          <a href="#" className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub Repo
          </a>
          <a href="#" className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            Live Demo
          </a>
        </div>
      </div>
  );
};

// --- MAIN COMPONENT ---
export default function LandingPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [serverStatus, setServerStatus] = useState('warming');
  const [elapsed, setElapsed] = useState(0);
  const [activeFeature, setActiveFeature] = useState('matching');
  const [mobileOpen, setMobileOpen] = useState(false);

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
      } catch (_) {}
    };

    const attemptSilentLogin = async () => {
      const token = apiService.getToken();
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, { headers: apiService.getHeaders(true) });
        if (response.ok) navigate('/dashboard');
        else apiService.clearSession();
      } catch (_) {}
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

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
      <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <StatusNotice status={serverStatus} elapsed={elapsed} />

        {/* NAVIGATION */}
        <nav className="fixed top-0 w-full z-40 border-b border-slate-100 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/Logo.png" alt="Quasar" className="h-9 w-9 rounded-lg object-contain" />
              <span className="text-xl font-bold tracking-tight text-slate-900">Quasar</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</button>
              <button onClick={() => scrollToSection('projects')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Projects</button>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors">Sign In</Link>
              <Link to="/register" className="bg-slate-900 text-white px-5 py-2.5 text-sm font-semibold rounded-lg hover:bg-emerald-800 transition-all">Get Started</Link>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-600">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileOpen && (
              <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-4">
                <button onClick={() => { scrollToSection('features'); setMobileOpen(false); }} className="block w-full text-left text-sm font-medium text-slate-600 py-2">Features</button>
                <button onClick={() => { scrollToSection('projects'); setMobileOpen(false); }} className="block w-full text-left text-sm font-medium text-slate-600 py-2">Projects</button>
                <Link to="/login" className="block w-full text-center text-sm font-semibold text-slate-600 py-2">Sign In</Link>
                <Link to="/register" className="block w-full text-center bg-slate-900 text-white px-5 py-3 text-sm font-semibold rounded-lg">Get Started</Link>
              </div>
          )}
        </nav>

        {/* HERO SECTION */}
        <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
                  Build meaningful projects with the <span className="text-emerald-800">right team.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed mb-8">
                  Discover student projects, find teammates based on skills, manage your work in one workspace, and showcase what you build.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/discover/projects" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold text-base hover:bg-emerald-800 transition-all">
                    Explore Projects <ArrowRight size={18} />
                  </Link>
                  <Link to="/projects/create" className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-300 px-8 py-4 rounded-lg font-semibold text-base hover:border-slate-400 hover:bg-slate-50 transition-all">
                    Create a Project
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* JOURNEY STRIP */}
        <section className="border-y border-slate-200 bg-slate-50 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Discover', desc: 'Find projects or create a new idea.' },
                { step: '02', title: 'Connect', desc: 'Find students with the skills you need.' },
                { step: '03', title: 'Collaborate', desc: 'Work through chat, tasks, and rooms.' },
                { step: '04', title: 'Showcase', desc: 'Complete the project and build your portfolio.' }
              ].map(item => (
                  <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                  >
                    <p className="text-xs font-black text-emerald-700 mb-2">{item.step}</p>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* INTERACTIVE FEATURES SECTION */}
        <section id="features" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl mb-10">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-3">Everything you need to ship.</h2>
              <p className="text-lg text-slate-600">From initial discovery to final showcase, Quasar provides the structure student teams need to succeed.</p>
            </div>

            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
              <div className="space-y-2">
                {[
                  { id: 'matching', icon: Users, title: 'Skill Gaps & Matching', desc: 'Build teams around complementary skills, not guesswork. See what your team needs before you invite the next person.' },
                  { id: 'workspace', icon: Layers, title: 'Project Workspace', desc: 'One project. One shared workspace. Manage tasks, chat with your team, and track progress seamlessly.' },
                  { id: 'portfolio', icon: Briefcase, title: 'Portfolio Evidence', desc: 'Do not just say you worked on a project. Show what you contributed with verified portfolio entries.' }
                ].map(feature => (
                    <button
                        key={feature.id}
                        onClick={() => setActiveFeature(feature.id)}
                        className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${
                            activeFeature === feature.id
                                ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${activeFeature === feature.id ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                          <feature.icon size={20} />
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold mb-1 ${activeFeature === feature.id ? 'text-emerald-900' : 'text-slate-900'}`}>{feature.title}</h3>
                          <p className={`text-sm leading-relaxed ${activeFeature === feature.id ? 'text-emerald-800' : 'text-slate-600'}`}>{feature.desc}</p>
                        </div>
                      </div>
                    </button>
                ))}
              </div>

              <div className="lg:sticky lg:top-24">
                <AnimatePresence mode="wait">
                  <motion.div
                      key={activeFeature}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                  >
                    <FeatureMockup activeTab={activeFeature} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE PROJECTS SECTION */}
        <section id="projects" ref={projectsRef} className="py-16 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-3">Live from the community</h2>
                <p className="text-lg text-slate-600">Real-time projects from students ready to build. Find your next opportunity.</p>
              </div>
              <Link to="/discover/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-900 transition-colors whitespace-nowrap">
                View all projects <ArrowRight size={16} />
              </Link>
            </div>

            {/* Status Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3">
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${serverStatus === 'warming' ? 'animate-pulse bg-amber-500' : 'bg-emerald-600'}`} />
                <p className="text-sm font-medium text-slate-700">
                  {serverStatus === 'warming' ? 'Connecting to live project data...' : 'Live project feed connected.'}
                </p>
              </div>
              {serverStatus === 'warming' ? (
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
                    <motion.div className="h-full rounded-full bg-amber-500" animate={{ width: `${Math.min((elapsed / 30) * 100, 92)}%` }} />
                  </div>
              ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                Showing {projects.length} recent projects
              </span>
              )}
            </div>

            {/* Staggered Grid */}
            <motion.div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {projects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* USE CASES SECTION */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl mb-10">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-3">Built for how you actually work.</h2>
              <p className="text-lg text-slate-600">Whether you are starting a final-year project or forming a hackathon team, Quasar adapts to your goals.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Hackathon Teams', msg: 'Find the missing skill before the timer starts. Combine technical, design, and presentation skills in one place.', icon: Zap },
                { title: 'Final-Year Projects', msg: 'Make your project easier to manage and explain. Define goals, track tasks, and document contributions for your portfolio.', icon: FolderOpen },
                { title: 'Student Clubs', msg: 'Give your community a shared place to build. Organize internal projects and connect students across departments.', icon: Users }
              ].map(useCase => (
                  <motion.div
                      key={useCase.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="p-6 rounded-xl border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all bg-white"
                  >
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-800 mb-4">
                      <useCase.icon size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{useCase.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{useCase.msg}</p>
                  </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
  );
}