import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ChevronRight, Terminal,
  Code, GitMerge, Layers, Search,
  Cpu, Layout, ShieldCheck, Activity, Users,
  MessageSquare, Calendar, Briefcase, Award,
  Zap, Globe, BookOpen, CheckCircle2,
  Target, Lightbulb, TrendingUp, FolderOpen,
  Sparkles, Send, UserPlus, Network, Loader2, Wifi, WifiOff
} from 'lucide-react';
import { projectService } from '@/services/projectService';

// --- MOCK DATA FOR WARM-UP PHASE ---
const MOCK_PROJECTS = [
  {
    id: 'mock-1',
    title: "AI Study Planner",
    description: "An automated scheduling tool that syncs with your syllabus to optimize study blocks using machine learning.",
    techStack: ["React", "Python", "FastAPI"],
    status: "Warming...",
    currentTeamSize: 2,
    maxTeamSize: 4,
    lead: { firstName: "Sarah", branch: "CS", lastName: "---" }
  },
  {
    id: 'mock-2',
    title: "Decentralized Campus Market",
    description: "A peer-to-peer marketplace for students to trade textbooks and equipment securely using blockchain.",
    techStack: ["Solidity", "Next.js", "Tailwind"],
    status: "Warming...",
    currentTeamSize: 1,
    maxTeamSize: 3,
    lead: { firstName: "Alex", branch: "IT", lastName: "---" }
  },
  {
    id: 'mock-3',
    title: "Eco-Track IoT",
    description: "Hardware and software integration to track energy consumption in dormitories in real-time.",
    techStack: ["C++", "Node.js", "MQTT"],
    status: "Warming...",
    currentTeamSize: 3,
    maxTeamSize: 5,
    lead: { firstName: "James", branch: "ECE", lastName: "---" }
  }
];

const SectionDivider = () => (
  <div className="w-full flex items-center justify-center py-20">
    <div className="w-12 h-px bg-slate-300" />
  </div>
);

// --- SERVER STATUS TOAST ---
const ServerStatusToast = ({ status }) => {
  if (status === 'live-notified') return null; // Hide after user sees it's live

  return (
    <AnimatePresence>
      {status !== 'live' && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md"
        >
          <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-4 flex items-center gap-4">
            <div className="flex-shrink-0">
              {status === 'warming' ? (
                <div className="relative">
                  <div className="absolute inset-0 animate-ping bg-amber-500/20 rounded-full"></div>
                  <Loader2 className="animate-spin text-amber-500 relative" size={24} />
                </div>
              ) : (
                <div className="bg-emerald-500/20 p-2 rounded-full">
                  <Wifi className="text-emerald-500" size={24} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-white text-sm font-bold">
                {status === 'warming' ? "Engines Warming Up..." : "Systems Online!"}
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                {status === 'warming'
                  ? "Our backend is waking up (takes ~3 mins). You're viewing cached data in the meantime."
                  : "The connection is established. Real-time projects are now live."}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ProblemCard = ({ number, title, problem, solution, icon: Icon, image, reverse }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="group"
  >
    <div className={`grid lg:grid-cols-12 gap-8 lg:gap-16 items-center`}>
      <div className={`lg:col-span-5 ${reverse ? 'lg:order-2' : ''}`}>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl font-black text-slate-100 absolute -mt-12 -ml-4 z-0 select-none">{number}</span>
          <div className="relative z-10 p-2.5 bg-slate-900 rounded-lg text-white">
            <Icon size={20} />
          </div>
          <h3 className="relative z-10 text-2xl font-bold tracking-tight text-slate-900">{title}</h3>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 mb-2">The Problem</h4>
            <p className="text-base text-slate-600 leading-relaxed font-medium">
              {problem}
            </p>
          </div>

          <div className="p-5 bg-slate-50 border-l-4 border-slate-900 rounded-r-xl">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-2">The Quasar Solution</h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {solution}
            </p>
          </div>
        </div>
      </div>

      <div className={`lg:col-span-7 ${reverse ? 'lg:order-1' : ''}`}>
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
        </div>
      </div>
    </div>
  </motion.div>
);

const StepCard = ({ step, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: parseInt(step) * 0.1 }}
    className="text-center"
  >
    <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">{step}</div>
    <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">{description}</p>
  </motion.div>
);

export default function LandingPage() {
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [serverStatus, setServerStatus] = useState('warming'); // warming, live, live-notified
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const projectsSectionRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Health Check Polling
  useEffect(() => {
    let pollInterval;

    const checkHealth = async () => {
      try {
        // This calls: http://localhost:8080/api/health (or your Render URL)
        const response = await fetch(`${API_BASE_URL}/health`);

        if (response.ok) {
          console.log("Backend is live!");
          setServerStatus('live');

          // Stop polling
          if (pollInterval) clearInterval(pollInterval);

          // Fetch the actual data
          fetchRealProjects();

          // Optional: Clear "live" status UI after 5 seconds
          setTimeout(() => setServerStatus('live-notified'), 5000);
        }
      } catch (err) {
        console.log("Backend warming up... (Spinning up Web Service)");
      }
    };

    const fetchRealProjects = async () => {
      try {
        const res = await projectService.getRecentProjects();
        // Handle different possible API response structures
        const projectData = res.data?.content || res.content || res.data || [];

        if (Array.isArray(projectData) && projectData.length > 0) {
          setProjects(projectData);
        }
      } catch (err) {
        console.error("Error fetching live projects:", err);
      } finally {
        setLoading(false);
      }
    };


    checkHealth();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [API_BASE_URL]);

  const scrollToProjects = () => {
    projectsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <ServerStatusToast status={serverStatus} />

      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="relative z-10 flex items-center gap-3">
              <img
                src="/Logo.png"
                alt="Quasar Logo"
                className="w-10 h-10 object-contain shadow-sm rounded-lg"
              />
              <span className="text-xl font-bold tracking-tight text-slate-900">Quasar</span>
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Sign In</Link>
            <Link to="/register" className="bg-slate-900 text-white px-5 py-2.5 text-sm font-medium rounded-md hover:bg-slate-800 transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-6">Student Collaboration Platform</p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-slate-900 mb-8">
              Find Your Team. <span className="text-slate-500">Build Real Projects.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-xl leading-relaxed mb-10">
              Stop coding alone. Quasar connects you with skilled teammates for academic projects, hackathons, and portfolio-building — matched by what you can do.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/register')} className="px-8 py-4 bg-slate-900 text-white rounded-md font-semibold text-base hover:bg-slate-800 transition-colors flex items-center gap-2">
                Find Teammates <ArrowRight size={18} />
              </button>
              <button onClick={scrollToProjects} className="px-8 py-4 border border-slate-300 rounded-md font-semibold text-base text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors">
                Browse Projects
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEMS SECTION */}
      <section className="px-6 max-w-6xl mx-auto py-20">
        <div className="space-y-32">
          <ProblemCard
            number="01"
            title="The 'Friend Circle' Limitation"
            icon={Users}
            problem="Your friends are great, but they might not have the React, Python, or AWS skills your project needs."
            solution="Quasar breaks the bubble. Find teammates across your entire college based strictly on verified tech stacks."
            image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200"
            reverse={false}
          />
        </div>
      </section>

      {/* PROJECTS SECTION WITH MOCK DATA FALLBACK */}
      <section ref={projectsSectionRef} className="bg-slate-50 border-y border-slate-200 py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">Live Network</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">See What Students Are Building</h2>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 35s linear infinite;
          }
          .pause-on-hover:hover .animate-scroll {
            animation-play-state: paused;
          }
        `}} />

        <div className="relative pause-on-hover">
          <div className="flex w-fit animate-scroll">
            {[...projects, ...projects].map((project, idx) => (
              <div
                key={`${project.id}-${idx}`}
                className="w-[90vw] md:w-[400px] mx-3 flex-shrink-0 bg-white border border-slate-200 rounded-xl p-7 hover:shadow-xl hover:border-slate-400 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-2.5 bg-slate-900 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
                      <Cpu size={18} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${serverStatus === 'live' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'
                      }`}>
                      {serverStatus === 'live' ? (project.status || 'Active') : 'Waking Up...'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight line-clamp-1">{project.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.techStack?.slice(0, 3).map((tech, i) => (
                      <span key={i} className="text-[11px] font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">{tech}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 border-2 border-white shadow-sm overflow-hidden">
                      {project.lead?.profilePictureUrl ? (
                        <img src={project.lead.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                      ) : (project.lead?.firstName?.[0] || 'P')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                        {project.lead?.firstName} {project.lead?.lastName !== '---' ? project.lead?.lastName : ''}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {project.lead?.branch || 'Engineer'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Users size={12} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-900">{project.currentTeamSize}/{project.maxTeamSize}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 max-w-6xl mx-auto py-24">
        <div className="grid md:grid-cols-3 gap-8">
          <StepCard step="01" title="Create Your Profile" description="Sign up and list your skills. Our AI analyzes your background to understand what you bring to the table." />
          <StepCard step="02" title="Post or Join" description="Have an idea? Post it. Looking to contribute? Browse active projects and apply with one click." />
          <StepCard step="03" title="Build & Verify" description="Every contribution is tracked and added to your professional portfolio automatically." />
        </div>
      </section>

      <footer className="border-t border-slate-200 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-slate-400">Built for Engineers. Designed for Students.</p>
        </div>
      </footer>
    </div>
  );
}