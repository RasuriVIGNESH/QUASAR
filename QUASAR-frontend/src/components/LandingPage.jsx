import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ChevronRight, Terminal,
  Code, GitMerge, Layers, Search,
  Cpu, Layout, ShieldCheck, Activity, Users,
  MessageSquare, Calendar, Briefcase, Award,
  Zap, Globe, BookOpen, CheckCircle2,
  Target, Lightbulb, TrendingUp, FolderOpen,
  Sparkles, Send, UserPlus, Network
} from 'lucide-react';
import { projectService } from '@/services/projectService';

const SectionDivider = () => (
  <div className="w-full flex items-center justify-center py-20">
    <div className="w-12 h-px bg-slate-300" />
  </div>
);

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

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="group p-8 border border-slate-200 rounded-lg hover:border-slate-400 transition-colors duration-300 bg-white"
  >
    <div className="mb-5">
      <div className="w-10 h-10 flex items-center justify-center rounded-md bg-slate-900 text-white">
        <Icon size={18} strokeWidth={2} />
      </div>
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
  </motion.div>
);

const StatItem = ({ value, label }) => (
  <div className="text-center">
    <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{value}</p>
    <p className="text-sm text-slate-500 uppercase tracking-widest font-medium">{label}</p>
  </div>
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
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const projectsSectionRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getRecentProjects();
        const projectData = res.data?.content || res.content || [];
        setProjects(projectData);
      } catch (err) {
        console.error("Initializing backend...");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const scrollToProjects = () => {
    projectsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
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

      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-6">Student Collaboration Platform</p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-slate-900 mb-8">
              Find Your Team. <span className="text-slate-500">Build Real Projects.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-xl leading-relaxed mb-10">
              Stop coding alone. Quasar connects you with skilled teammates for academic projects, hackathons, and portfolio-building — matched by what you can do, not who you know.
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
      {/* --- PROBLEMS WE SOLVE --- */}
      <section className="px-6 max-w-6xl mx-auto py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">The Student Struggle</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Why We Built Quasar</h2>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
            The gap between learning to code and building a career is filled with these two hurdles.
            We built a platform to bridge them.
          </p>
        </motion.div>

        <div className="space-y-32">
          {/* Problem 01 */}
          <ProblemCard
            number="01"
            title="The 'Friend Circle' Limitation"
            icon={Users}
            problem="Your friends are great, but they might not have the React, Python, or AWS skills your project needs. You're often forced to choose between working alone or with a team that can't contribute."
            solution="Quasar breaks the bubble. Find teammates across your entire college based strictly on their verified tech stack and interests. Build with people who actually complement your skills."
            image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200"
            reverse={false}
          />

          {/* Problem 02 */}
          <ProblemCard
            number="02"
            title="The 'Empty GitHub' Paradox"
            icon={Code}
            problem="You've finished the tutorials, but your resume is still empty. Recruiters can't see your potential because you lack real-world collaborative projects to prove your skills."
            solution="Join active builds and start contributing. Every task you finish and every PR you merge is tracked and displayed on your Quasar profile—giving you a verified portfolio that speaks louder than a resume."
            image="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=1200"
            reverse={true}
          />
        </div>
      </section>

      {/* --- HOW QUASAR FIXES THIS --- */}
      <section className="px-6 max-w-6xl mx-auto py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">
            Our Approach
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            How Quasar Fixes This
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
            Flip each card to see how we solve the core problems of student engineering.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: FolderOpen,
              title: "Post Projects",
              short: "List skills you need",
              image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600",
              detail: "Create a project and define exactly what skills your team is missing — React, Python, UI Design, DevOps. Students with those skills see your project and apply."
            },
            {
              icon: Sparkles,
              title: "AI Matching",
              short: "Find perfect teammates",
              image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600",
              detail: "Our engine analyzes profiles, skills, and project needs to recommend the best teammates. No more guessing or settling for whoever is free."
            },
            {
              icon: Users,
              title: "Build Network",
              short: "Beyond your friend circle",
              image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600",
              detail: "Every project connects you with skilled peers across your college. Your professional network grows with every collaboration."
            },
            // {
            //   icon: Briefcase,
            //   title: "Real Portfolio",
            //   short: "Verified contributions",
            //   image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=600",
            //   detail: "Every commit, review, and task is tracked on your profile. Recruiters see proof of what you can build — not just a list of technologies."
            // },
            {
              icon: Layout,
              title: "Manage Tasks",
              short: "Built-in project tools",
              image: "https://images.unsplash.com/photo-1540350394557-8d14678e7f91?auto=format&fit=crop&q=80&w=600", // New clearer image
              detail: "Task boards, sprint planning, and progress tracking — all in one place. No more juggling Trello, Jira, and spreadsheets."
            },
            {
              icon: MessageSquare,
              title: "Team Chat",
              short: "Real-time communication",
              image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
              detail: "Built-in chat for every project. Discuss code, share files, and resolve blockers without leaving the platform."
            },
            {
              icon: Calendar,
              title: "Hackathons",
              short: "Events & competitions",
              image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600",
              detail: "Discover college hackathons and coding events. Form dedicated teams, compete, and expand your network while you build."
            }
            // {
            //   icon: Award,
            //   title: "Get Verified",
            //   short: "Proof of your skills",
            //   image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
            //   detail: "Merge requests, code reviews, and completed tasks are verified and linked to your profile. Show, don't tell."
            // }
          ].map((item, idx) => (
            <div
              key={idx}
              className="group h-80 w-full"
              style={{ perspective: '1000px' }}
            >
              <div
                className="relative w-full h-full transition-transform duration-500 shadow-sm"
                style={{
                  transformStyle: 'preserve-3d',
                  // This is the logic that handles the flip on hover
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'rotateY(180deg)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'rotateY(0deg)'}
              >
                {/* --- FRONT SIDE --- */}
                <div
                  className="absolute inset-0 w-full h-full rounded-xl overflow-hidden border border-slate-200"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover brightness-[0.4]"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-white mb-4 border border-white/30">
                      <item.icon size={22} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-white/80">{item.short}</p>
                    <div className="absolute bottom-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      Hover to flip
                    </div>
                  </div>
                </div>

                {/* --- BACK SIDE --- */}
                <div
                  className="absolute inset-0 w-full h-full bg-slate-900 text-white rounded-xl p-8 flex flex-col justify-center border border-slate-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 mb-4">
                    <item.icon size={20} className="text-white" />
                  </div>
                  <h4 className="text-lg font-bold mb-3">{item.title}</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {item.detail}
                  </p>
                  <div className="mt-6 pt-4 border-t border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Quasar Infrastructure
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- PROJECTS SECTION --- */}
      <section ref={projectsSectionRef} className="bg-slate-50 border-y border-slate-200 py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">Live Network</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">See What Students Are Building</h2>
            </div>
            <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors">
              View All Projects <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* CSS for the infinite scroll and hover pause */}
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
          {loading ? (
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-72 bg-white rounded-lg border border-slate-200 animate-pulse" />)}
            </div>
          ) : (
            <div className="flex w-fit animate-scroll">
              {/* Duplicate the project list to create a seamless loop */}
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
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        {project.status || 'Active'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.techStack?.slice(0, 3).map((tech, i) => (
                        <span key={i} className="text-[11px] font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                          {tech}
                        </span>
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
                        <span className="text-sm font-bold text-slate-900">{project.currentTeamSize + 1}/{project.maxTeamSize}</span>
                      </div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Availability</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <SectionDivider />

      <section className="px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">Simple Process</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">How It Works</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <StepCard step="01" title="Create Your Profile" description="Sign up and list your skills, interests, and GitHub. Our AI analyzes your background to understand what you bring to the table." />
          <StepCard step="02" title="Post or Join a Project" description="Have an idea? Post it with required skills. Looking to contribute? Browse active projects and apply with one click." />
          <StepCard step="03" title="Build & Get Verified" description="Ship code, review PRs, manage tasks. Every contribution is tracked and added to your professional portfolio automatically." />
        </div>
      </section>

      <SectionDivider />

      <footer className="border-t border-slate-200 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-slate-300 rounded flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">Q</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Quasar Infrastructure</span>
            </div>
            <div className="flex gap-8 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <button className="hover:text-slate-900 transition-colors">Documentation</button>
              <button className="hover:text-slate-900 transition-colors">Privacy</button>
              <button className="hover:text-slate-900 transition-colors">Terms</button>
            </div>
          </div>
          <div className="text-center md:text-left">
            <p className="text-xs text-slate-400">Built for Engineers. Designed for Students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}