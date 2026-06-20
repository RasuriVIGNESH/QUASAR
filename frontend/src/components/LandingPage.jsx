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
  Sparkles, Send, UserPlus, Network, Loader2, Wifi, Star, ExternalLink, AlertCircle
} from 'lucide-react';
import { projectService } from '@/services/projectService';
import { apiService } from '@/services/api';

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

// --- DESIGN SYSTEM CONSTANTS ---
const COLORS = {
  primary: '#4F46E5', // Indigo 600
  secondary: '#0F172A', // Slate 900
  accent: '#10B981', // Emerald 500
  surface: '#F8FAFC', // Slate 50
  border: '#E2E8F0', // Slate 200
  text: '#334155', // Slate 700
};

// --- SUB-COMPONENTS ---

const Badge = ({ children, variant = 'primary' }) => {
  const styles = {
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${styles[variant]}`}>
      {children}
    </span>
  );
};

const SectionHeading = ({ subtitle, title, description, align = 'center' }) => (
  <div className={`max-w-3xl mb-16 ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}>
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-indigo-600 font-bold text-sm uppercase tracking-[0.2em] mb-4"
    >
      {subtitle}
    </motion.p>
    <motion.h2
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
    >
      {title}
    </motion.h2>
    {description && (
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-lg text-slate-600 leading-relaxed"
      >
        {description}
      </motion.p>
    )}
  </div>
);

const FeatureCard = ({ icon: Icon, title, problem, solution, image, reverse }) => (
  <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20 py-16`}>
    <motion.div
      initial={{ opacity: 0, x: reverse ? 50 : -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex-1 space-y-8"
    >
      <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 text-white">
        <Icon size={28} />
      </div>
      <h3 className="text-3xl font-bold text-slate-900">{title}</h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-8 h-px bg-rose-200" /> The Friction
          </h4>
          <p className="text-slate-600 text-lg leading-relaxed">{problem}</p>
        </div>
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
          <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">The Quasar Solution</h4>
          <p className="text-slate-700 font-medium">{solution}</p>
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="flex-1 w-full"
    >
      <div className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 to-emerald-500/10 rounded-[2rem] blur-2xl group-hover:opacity-100 transition-opacity opacity-0" />
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 shadow-2xl">
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
        </div>
      </div>
    </motion.div>
  </div>
);

// --- IMPROVED SERVER STATUS TOAST ---
const ServerStatusToast = ({ status, elapsedSeconds }) => {
  if (status === 'live-notified') return null;

  const isWarming = status === 'warming';
  const progress = Math.min((elapsedSeconds / 30) * 100, 100);

  return (
    <AnimatePresence>
      {status !== 'live' && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md"
        >
          <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-1">
                {isWarming ? (
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping bg-amber-500/20 rounded-full"></div>
                    <Loader2 className="animate-spin text-amber-500 relative" size={24} />
                  </div>
                ) : (
                  <div className="bg-emerald-500/20 p-2 rounded-full">
                    <CheckCircle2 className="text-emerald-500" size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-white text-sm font-bold">
                  {isWarming ? "Backend Initializing..." : "Systems Online!"}
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed mt-1">
                  {isWarming
                    ? "Our backend is starting up. This typically takes 20-30 seconds. You're viewing sample projects in the meantime."
                    : "Connection established. Live projects are now loading in real-time."}
                </p>
              </div>
            </div>

            {isWarming && (
              <div className="space-y-2">
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Initialization</span>
                  <span className="text-[10px] text-slate-400 font-bold">{elapsedSeconds}s / 30s</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- MAIN COMPONENT ---

export default function LandingPage() {
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [serverStatus, setServerStatus] = useState('warming'); // warming, live, live-notified
  const [loading, setLoading] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const projectsSectionRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const pollIntervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Timer for elapsed seconds display
  useEffect(() => {
    if (serverStatus === 'warming') {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(elapsed);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [serverStatus]);

  // Health Check Polling
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);

        if (response.ok) {
          console.log("Backend is live!");
          setServerStatus('live');

          // Stop polling
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

          // Fetch the actual data
          fetchRealProjects();

          // Backend just came up — if a JWT is already sitting in the
          // browser from a previous session, try it silently. If it's
          // still valid, skip the landing page entirely and go straight
          // to the dashboard. If it's not, just stay here and let the
          // person log in normally — no error shown, no interruption.
          attemptSilentLogin();

          // Clear "live" status UI after 5 seconds
          setTimeout(() => setServerStatus('live-notified'), 5000);
        }
      } catch (err) {
        console.log("Backend warming up... (Spinning up Web Service)");
      }
    };

    const attemptSilentLogin = async () => {
      const token = apiService.getToken();
      if (!token) return; // nothing stored, nothing to do

      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: apiService.getHeaders(true),
        });

        if (res.ok) {
          // Token still valid — user is already authenticated, take them in.
          navigate('/dashboard');
        } else {
          // Token expired/invalid — clear it so the next login starts clean.
          apiService.clearSession();
        }
      } catch (err) {
        // Network hiccup right as the backend wakes up — don't clear the
        // token for this, just let the person log in manually this time.
        console.log("Silent login check failed, continuing as guest:", err);
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

    // Initial check
    checkHealth();

    // Poll every 3 seconds
    pollIntervalRef.current = setInterval(checkHealth, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [API_BASE_URL]);

  const scrollToProjects = () => {
    projectsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scrolls to a section by id. Works even if called from a route other than
  // "/" (e.g. someone lands on /login and the nav is still mounted) by
  // navigating home first, then scrolling once the page has rendered.
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    // Section isn't on this route — go home, then scroll after render.
    navigate('/');
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // On mount, if the URL already has a hash (e.g. someone followed a link
  // like /#features directly), scroll to it once content has rendered.
  useEffect(() => {
    const hash = window.location.hash?.replace('#', '');
    if (hash) {
      const timer = setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">

      <ServerStatusToast status={serverStatus} elapsedSeconds={elapsedSeconds} />

      {/* NAVIGATION */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 py-3' : 'bg-transparent py-6'
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/Logo.png"
              alt="Quasar Logo"
              className="w-10 h-10 object-contain shadow-sm rounded-lg group-hover:scale-110 transition-transform"
            />
            <span className="text-2xl font-black tracking-tighter text-slate-900">Quasar</span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {[
              { label: 'Features', id: 'features' },
              { label: 'Projects', id: 'projects' }
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2">Sign In</Link>
            <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 text-sm font-bold rounded-full hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-52 lg:pb-40 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-slate-900 mb-10">
                Ship Projects. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">Find Your Tribe.</span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-500 max-w-2xl leading-relaxed mb-12 font-medium">
                Quasar bridges the gap between academic theory and production-ready software by connecting students through verified skill-matching.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <button onClick={() => navigate('/register')} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 group">
                  Start Building <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={scrollToProjects} className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                  Browse Ecosystem
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* PROBLEM & SOLUTION SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-32">
        <SectionHeading
          subtitle="Why Quasar?"
          title="Engineered to Solve the Solo Coder's Dilemma"
          description="We identified the three biggest hurdles in student project development and built the tools to dismantle them."
        />

        <div className="space-y-12">
          <FeatureCard
            icon={Users}
            title="The 'Friend Circle' Trap"
            problem="Your immediate social circle is great for coffee, but they might not have the specific AWS, Rust, or UI/UX skills your vision requires."
            solution="Quasar's Neural Matching Engine scans the entire campus network to find the exact skill-match for your stack, regardless of social circles."
            image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200"
            reverse={false}
          />
          <FeatureCard
            icon={GitMerge}
            title="The Ghosting Epidemic"
            problem="Halfway through a hackathon, teammates disappear. Accountability is non-existent in casual Discord groups or WhatsApp chats."
            solution="Our Proof-of-Contribution system tracks active participation. Students build a 'Collaboration Score' that recruiters actually trust."
            image="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200"
            reverse={true}
          />
        </div>
      </section>

      {/* LIVE PROJECTS (Horizontal Scroll) */}
      <section id="projects" ref={projectsSectionRef} className="bg-slate-50 border-y border-slate-200 py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <SectionHeading
              align="left"
              subtitle="Live Ecosystem"
              title="What's being shipped right now"
              description="Real-time projects from the Quasar network. No fluff, just code."
            />
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full border border-indigo-600 shadow-sm hover:bg-indigo-700 transition-all font-bold text-sm uppercase tracking-widest">
              Explore All Projects
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 40s linear infinite;
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
                className="w-[350px] md:w-[450px] mx-4 flex-shrink-0 bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink size={20} className="text-slate-300" />
                </div>
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 bg-slate-900 rounded-2xl text-white group-hover:bg-indigo-600 transition-colors">
                      <Cpu size={22} />
                    </div>
                    <Badge variant={serverStatus === 'live' ? 'accent' : 'warning'}>
                      {project.status || 'Active'}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight group-hover:text-indigo-600 transition-colors">{project.title}</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed line-clamp-2 font-medium">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.techStack?.map((tech, i) => (
                      <span key={i} className="text-[11px] font-bold px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">{tech}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {project.lead?.firstName?.[0] || 'P'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                        {project.lead?.firstName} {project.lead?.lastName !== '---' ? project.lead?.lastName : ''}
                      </p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                        {project.lead?.branch || 'Engineer'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                    <Users size={14} className="text-slate-400" />
                    <span className="text-sm font-black text-slate-900">{project.currentTeamSize + 1}/{project.maxTeamSize}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <SectionHeading
          subtitle="The Process"
          title="Three Steps to Your Next Big Project"
        />

        <div className="grid md:grid-cols-3 gap-12">
          {[
            { step: '01', title: 'Create Your Profile', desc: 'Sign up and list your skills. Our AI analyzes your background to understand what you bring to the table.', icon: UserPlus },
            { step: '02', title: 'Post or Join', desc: 'Have an idea? Post it. Looking to contribute? Browse active projects and apply with one click.', icon: Target },
            { step: '03', title: 'Build & Verify', desc: 'Every contribution is tracked and added to your professional portfolio automatically.', icon: Zap }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                <item.icon size={28} />
              </div>
              <div className="text-4xl font-black text-slate-100 mb-4 group-hover:text-indigo-50 transition-colors">{item.step}</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full -ml-32 -mb-32 blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
              Stop coding in a vacuum. <br />
              Start building a legacy.
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button onClick={() => navigate('/register')} className="px-12 py-6 bg-white text-indigo-600 rounded-2xl font-black text-xl hover:bg-slate-50 transition-all shadow-xl active:scale-95">
                Join the Network
              </button>
              <button className="px-12 py-6 bg-indigo-700 text-white rounded-2xl font-black text-xl hover:bg-indigo-800 transition-all border border-indigo-500/30">
                Contact for Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <img
              src="/Logo.png"
              alt="Quasar Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-black tracking-tighter text-slate-900">QUASAR</span>
          </div>

          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Built for Engineers. Designed for the Future.
          </p>

          <div className="flex gap-8">
            {['Twitter', 'GitHub', 'LinkedIn'].map(social => (
              <a key={social} href="#" className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                {social}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}