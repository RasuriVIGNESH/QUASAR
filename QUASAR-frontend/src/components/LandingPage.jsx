import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Target,
  Trophy,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Rocket,
  GitBranch,
  TrendingUp,
  Shield,
  Star,
  Code,
  Globe,
  Menu,
  X,
  Building2,
  Calendar,
  Users,
  ArrowUp
} from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { projectService } from '@/services/projectService';
import { skillsService } from '@/services/skillsService';
import { dataService } from '@/services/dataService';

// Standardized Animated Section
const AnimatedSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

const InfiniteMarquee = ({ children, className, duration = 40 }) => {
  return (
    <div className={`overflow-hidden flex w-full ${className}`}>
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
        className="flex flex-shrink-0 min-w-max items-stretch"
      >
        <div className="flex gap-8 flex-shrink-0 items-stretch mr-8">
          {children}
        </div>
        <div className="flex gap-8 flex-shrink-0 items-stretch mr-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const ProjectCard = ({ project, idx, isMarquee }) => {
  const lead = project.lead || {};
  const leadName = `${lead.firstName || 'Unknown'} ${lead.lastName && lead.lastName !== '---' ? lead.lastName : ''}`.trim();
  const skills = project.requiredSkills?.map(s => s.skill) || project.skills || [];
  const startDate = project.expectedStartDate ? new Date(project.expectedStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';

  return (
    <Card className={`h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 overflow-hidden flex flex-col group relative ${isMarquee ? 'w-[350px] md:w-[400px] shrink-0' : ''}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-violet-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

      <CardHeader className="pb-3 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col">
            <Badge variant="outline" className="w-fit mb-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/50 hover:bg-blue-100 dark:hover:bg-blue-900/30">
              {project.categoryName || 'Project'}
            </Badge>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {project.title}
            </CardTitle>
          </div>
          <Badge className={`shrink-0 ${project.status === 'RECRUITING' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            {project.status || 'Active'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-5 pt-0 mb-4">
        {/* Description & Goals */}
        <div className="space-y-3">
          {project.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {project.description}
            </p>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1">Goals</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {project.goals || "No specific goals listed."}
            </p>
          </div>
        </div>

        {/* Required Skills */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Required Skills</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 5).map((skillItem, sIdx) => {
              const skillName = skillItem.name || (typeof skillItem === 'string' ? skillItem : 'Skill');
              return (
                <div key={sIdx} className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  {skillName}
                </div>
              );
            })}
            {skills.length > 5 && (
              <div className="px-2 py-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700">
                +{skills.length - 5}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        {/* Lead & Stats */}
        <div className="space-y-4">
          {/* Created By */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Members</span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 pr-3 pl-1 py-1 rounded-full border border-slate-100/50 dark:border-slate-700/50">
              <Avatar className="h-6 w-6">
                <AvatarImage src={lead.profilePictureUrl} alt={leadName} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px]">
                  {lead.firstName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[120px] truncate">{leadName}</span>
            </div>
          </div>

          {/* Bottom Stats Info */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm text-blue-500">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Start</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{startDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-700">
              <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm text-violet-500">
                <Users className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Team</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{project.currentTeamSize + 1} <span className="text-slate-400 dark:text-slate-500 font-normal">/ {project.maxTeamSize}</span></span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card >
  );
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const headerBgOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 0.9]);
  const headerShadow = useTransform(scrollYProgress, [0, 0.1], ["none", "0 4px 6px -1px rgb(0 0 0 / 0.1)"]);

  const [publicData, setPublicData] = useState({
    projects: [],
    popularSkills: [],
    colleges: [],
    userCount: 0,
    projectCount: 0,
    loading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, skillsRes, collegesRes, countsRes] = await Promise.allSettled([
          projectService.getRecentProjects(),
          skillsService.getPopularSkills(0, 10, { preventRedirect: true }),
          dataService.getColleges({ preventRedirect: true }),
          dataService.getSystemCounts(),
        ]);

        const getList = (res) => {
          if (res.status === 'rejected') return [];
          const val = res.value;
          if (Array.isArray(val)) return val;
          return val.data?.content || val.content || val.data || [];
        };

        setPublicData({
          projects: getList(projectsRes),
          popularSkills: getList(skillsRes),
          colleges: getList(collegesRes),
          // Use counts from /count endpoint ([users, projects])
          userCount: countsRes.status === 'fulfilled'
            ? (Array.isArray(countsRes.value) ? (countsRes.value[0] || 0) : (countsRes.value.users || countsRes.value.userCount || 1250))
            : 1250,
          projectCount: countsRes.status === 'fulfilled'
            ? (Array.isArray(countsRes.value) ? (countsRes.value[1] || 0) : (countsRes.value.projects || countsRes.value.projectCount || (projectsRes.status === 'fulfilled' ? (projectsRes.value.data?.totalElements || 850) : 850)))
            : 850,
          loading: false
        });
      } catch (e) {
        console.error("Failed to fetch public data", e);
        setPublicData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchData();
  }, []);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const features = [
    {
      icon: <GitBranch className="h-6 w-6" />,
      title: "Project Collaboration",
      description: "Built-in tools for seamless team coordination and project management.",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Skills Analytics",
      description: "Track trending skills and plan your learning journey with data insights.",
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50 dark:bg-violet-900/20"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Achievement System",
      description: "Earn recognition and build your portfolio with every contribution.",
      color: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Networking",
      description: "Connect with students across different universities and domains.",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    }
  ];

  const benefits = [
    { text: "Showcase your projects and achievements", icon: <Trophy className="h-5 w-5" /> },
    { text: "Discover trending skills in your field", icon: <TrendingUp className="h-5 w-5" /> },
    { text: "Build your professional network early", icon: <Globe className="h-5 w-5" /> },
    { text: "Collaborate on real-world projects", icon: <Code className="h-5 w-5" /> },
    { text: "Get peer feedback and skill ratings", icon: <Star className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900/50 dark:selection:text-blue-100">
      {/* Sticky Header */}
      <motion.header
        style={{ backgroundColor: `rgba(255, 255, 255, ${headerBgOpacity})`, boxShadow: headerShadow }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-transparent transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 relative">
            <Link to="/" className="flex items-center gap-2">
              <img src="/data/logo.png" alt="Logo" className="h-9 w-9 rounded-lg object-cover" />
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                <span className="text-blue-600">Quasar</span>
              </span>
            </Link>

            {/* Desktop Navigation - Centered & Glassy */}
            <motion.nav
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 p-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-lg shadow-black/5 ring-1 ring-black/5"
            >
              <div className="flex items-center gap-1 px-2">
                {['projects', 'features', 'colleges'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollTo(item)}
                    className="relative px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all rounded-full hover:bg-white/80 dark:hover:bg-slate-800 capitalize"
                  >
                    {item === 'projects' ? 'Latest Projects' : item}
                  </button>
                ))}
              </div>
              <div className="pl-2 border-l border-slate-200 dark:border-slate-700 ml-2">
                <ModeToggle />
              </div>
            </motion.nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-4 md:hidden">
              <ModeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div >

        {/* Mobile Menu */}
        {
          mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-6 space-y-4"
            >
              <button onClick={() => scrollTo('projects')} className="block w-full text-left font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Latest Projects</button>
              <button onClick={() => scrollTo('features')} className="block w-full text-left font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Features</button>
              <button onClick={() => scrollTo('colleges')} className="block w-full text-left font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Colleges</button>
            </motion.div>
          )
        }
      </motion.header >

      {/* Hero Section */}
      < section className="relative pt-40 pb-24 overflow-hidden" >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 dark:bg-blue-900/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-violet-100/50 dark:bg-violet-900/30 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            {/* <Badge className="mb-6 px-4 py-1 bg-blue-50 text-blue-700 border-blue-100 rounded-full font-medium">
              🚀 Join 1,200+ students building the future
            </Badge> */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
              Connect. Collaborate. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                Create Together.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              The ultimate professional networking platform for college students.
              Find your perfect project partners based on complementary skills and shared interests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-200 hover:scale-105">
                  Join Quasar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 hover:border-blue-300 transition-all">
                  Sign In
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section >

      {/* Stats Section */}
      < section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800" >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Active Students", value: `${publicData.userCount}` },
              { label: "Projects Created", value: `${publicData.projectCount}` },
              { label: "Universities", value: `${publicData.colleges.length || 50}` },
              { label: "Success Rate", value: "98%" }
            ].map((stat, i) => (
              <div key={i} className="text-center group flex flex-col items-center">
                <div className="h-10 mb-1 flex items-center justify-center">
                  {publicData.loading ? (
                    <Skeleton className="h-8 w-24 bg-slate-200 dark:bg-slate-800" />
                  ) : (
                    <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Featured Projects */}
      {
        (publicData.loading || publicData.projects.length > 0) && (
          <section id="projects" className="py-24 px-4 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Latest Projects</h2>
                  <p className="text-slate-600 dark:text-slate-400">Discover what's being built by students right now.</p>
                </div>
                <Link to="/login">
                  <Button variant="link" className="text-blue-600 dark:text-blue-400 font-semibold p-0 flex items-center gap-1">
                    View all projects <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {publicData.loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="h-80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 w-full">
                          <Skeleton className="h-5 w-20 rounded-full bg-slate-100 dark:bg-slate-800" />
                          <Skeleton className="h-6 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full bg-slate-100 dark:bg-slate-800" />
                        <Skeleton className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded bg-slate-100 dark:bg-slate-800" />
                        <Skeleton className="h-6 w-16 rounded bg-slate-100 dark:bg-slate-800" />
                        <Skeleton className="h-6 w-16 rounded bg-slate-100 dark:bg-slate-800" />
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800" />
                        <Skeleton className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : publicData.projects.length > 3 ? (
                <div className="w-full py-8 md:py-12 relative">
                  {/* Fade gradients for marquee edges */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />

                  <InfiniteMarquee className="py-4" duration={Math.max(40, publicData.projects.length * 8)}>
                    {publicData.projects.map((project, idx) => (
                      <ProjectCard
                        key={project.id || idx}
                        project={project}
                        idx={idx}
                        isMarquee={true}
                      />
                    ))}
                  </InfiniteMarquee>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {publicData.projects.map((project, idx) => (
                    <AnimatedSection key={project.id || idx} delay={idx * 0.1}>
                      <ProjectCard project={project} idx={idx} />
                    </AnimatedSection>
                  ))}
                </div>
              )}
            </div>
          </section>
        )
      }

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Built for Student Success</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              Everything you need to find a team, grow your network, and build an impressive portfolio.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-md group">
                <div className={`${feature.bgColor} ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits / Social Proof */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
                Why thousands of students <br />
                <span className="text-blue-600 dark:text-blue-500">trust Quasar</span>
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-800 transition-transform hover:translate-x-2">
                    <div className="text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">{benefit.icon}</div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Institutional Trust */}
      {
        publicData.colleges.length > 0 && (
          <section id="colleges" className="py-16 px-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-10">Trusted by students from</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-60 dark:opacity-40">
                {publicData.colleges.slice(0, 5).map((college, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-lg italic">
                    <Building2 className="h-5 w-5" />
                    {college.name}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      }

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-12">
            <div className="max-w-sm">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <img src="/data/logo.png" alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
                <span className="text-xl font-bold text-slate-900 dark:text-white">Quasar</span>
              </Link>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                The leading collaboration platform for college students to connect, share skills, and build a professional portfolio together.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-12 sm:gap-24">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-6">Platform</h4>
                <ul className="space-y-4 text-slate-600 dark:text-slate-400">
                  <li><Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sign In</Link></li>
                  <li><Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Register</Link></li>
                  <li><Link to="/projects" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Browse Projects</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-6">Support</h4>
                <ul className="space-y-4 text-slate-600 dark:text-slate-400">
                  <li><Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Help Center</Link></li>
                  <li><Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                  <li><Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <p>© 2025 Quasar. Built with ❤️ for students.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Twitter</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div >
  );
}