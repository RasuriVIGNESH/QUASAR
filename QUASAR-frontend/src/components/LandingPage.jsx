import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, ArrowRight, CheckCircle, Sparkles, Zap, Rocket,
  GitBranch, TrendingUp, Star, Code, Globe, Menu, X,
  Building2, Calendar, Users, ArrowUp, ChevronRight, Shield
} from 'lucide-react';
import { projectService } from '@/services/projectService';
import { skillsService } from '@/services/skillsService';
import { dataService } from '@/services/dataService';

import { ShinyButton } from "@/components/ui/shiny-button";

/* ─── FUNCTIONAL RESPONSIVENESS (No design changes) ────────────────────── */
const ResponsiveStyles = () => (
  <style>{`
    /* This fixes the "Bad on Mobile" structure while keeping your design */
    .qx-r2 {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
      gap: 20px !important;
    }
    .qx-r1 {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 48px !important;
    }
    @media (max-width: 1024px) {
      .qx-r1 { grid-template-columns: 1fr !important; }
      .qx-hide-m { display: none !important; }
      .qx-show-m { display: flex !important; }
    }
    @media (max-width: 768px) {
      /* Stack the marquee vertically on mobile to prevent cut-off */
      .qx-mqtrack { 
        display: flex !important; 
        flex-direction: column !important; 
        animation: none !important; 
        padding: 0 24px !important;
        gap: 20px !important;
      }
      .qx-mqwrap { overflow: visible !important; }
      h1 { font-size: 38px !important; }
    }
    @keyframes qx-spin { to { transform: rotate(360deg); } }
    .qx-loading-icon { animation: qx-spin 1s linear infinite; }
  `}</style>
);

/* ─── Shooting Stars Canvas (Exactly as provided) ────────────────────────── */
const ShootingStarsCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId, nextShoot = 0;
    const tw = []; const sw = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 220; i++) {
      tw.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, r: Math.random() * 1.4 + 0.1, ph: Math.random() * Math.PI * 2, sp: Math.random() * 0.002 + 0.0007 });
    }
    const spawnShooter = () => {
      const COLORS = [['#9E00FF', '#2EB9DF'], ['#FF0099', '#FFB800'], ['#00FF9E', '#00B8FF'], ['#f97316', '#8b5cf6']];
      const [sc, tc] = COLORS[Math.floor(Math.random() * COLORS.length)];
      const spd = Math.random() * 7 + 5;
      const ang = (Math.random() * 28 + 14) * (Math.PI / 180);
      return { x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.45, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, len: Math.random() * 110 + 55, sc, tc, life: 0, max: Math.random() * 65 + 45 };
    };
    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of tw) {
        ctx.globalAlpha = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (t > nextShoot) { sw.push(spawnShooter()); nextShoot = t + Math.random() * 2400 + 650; }
      for (let i = sw.length - 1; i >= 0; i--) {
        const s = sw[i]; const p = s.life / s.max; const a = Math.max(0, p < 0.3 ? p / 0.3 : 1 - (p - 0.3) / 0.7);
        const mag = Math.hypot(s.vx, s.vy); const tx = s.x - (s.vx / mag) * s.len; const ty = s.y - (s.vy / mag) * s.len;
        const grad = ctx.createLinearGradient(tx, ty, s.x, s.y);
        grad.addColorStop(0, 'transparent'); grad.addColorStop(0.65, s.tc + '55'); grad.addColorStop(1, s.sc);
        ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(s.x, s.y); ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
        const hg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 8); hg.addColorStop(0, s.sc); hg.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(s.x, s.y, 8, 0, Math.PI * 2); ctx.fillStyle = hg; ctx.fill(); ctx.restore();
        s.x += s.vx; s.y += s.vy; s.life++;
        if (s.life >= s.max || s.x > canvas.width + 120 || s.y > canvas.height + 120) sw.splice(i, 1);
      }
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
};

/* ─── Project Card (Exactly as provided) ─────────────────────────────────── */
const ProjectCard = ({ project, isMarquee = false }) => {
  const lead = project.lead || {};
  const leadName = `${lead.firstName || 'Unknown'} ${lead.lastName && lead.lastName !== '---' ? lead.lastName : ''}`.trim();
  const skills = project.requiredSkills?.map(s => s.skill) || project.skills || [];
  const startDate = project.expectedStartDate ? new Date(project.expectedStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';

  return (
    <div className="qx-glass qx-lift" style={{ borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', width: isMarquee ? 364 : '100%', flexShrink: isMarquee ? 0 : 'unset' }}>
      <div className="qx-accent-bar" />
      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
          <div>
            <span className="qx-pill" style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 8 }}>{project.categoryName || 'Project'}</span>
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35, color: '#f0f4ff', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{project.title}</div>
          </div>
          <span className={project.status === 'RECRUITING' ? 'tag-recruiting' : 'tag-default'} style={{ flexShrink: 0 }}>{project.status || 'Active'}</span>
        </div>
        {project.description && <p style={{ fontSize: 13, lineHeight: 1.65, color: '#6b7280', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 12 }}>{project.description}</p>}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', marginBottom: 4 }}>Goals</div>
          <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.6, color: '#cbd5e1', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{project.goals || 'No specific goals listed.'}</p>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}><Sparkles style={{ width: 10, height: 10, color: '#f97316' }} /> Required Skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {skills.slice(0, 5).map((s, i) => (<span key={i} className="qx-skill" style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>{s.name || (typeof s === 'string' ? s : 'Skill')}</span>))}
          </div>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />
      </div>
      <div style={{ padding: '0 22px 20px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: '#374151', fontWeight: 500 }}>Lead</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 10px 4px 5px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', background: '#1e1a3d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
              {lead.profilePictureUrl ? <img src={lead.profilePictureUrl} alt={leadName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#8b5cf6' }}>{lead.firstName?.[0] || 'U'}</span>}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leadName}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ padding: 5, borderRadius: 7, background: 'rgba(139,92,246,0.14)' }}><Calendar style={{ width: 12, height: 12, color: '#8b5cf6' }} /></div>
            <div><div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151' }}>Start</div><div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{startDate}</div></div>
          </div>
          <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, borderLeft: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ padding: 5, borderRadius: 7, background: 'rgba(6,182,212,0.12)' }}><Users style={{ width: 12, height: 12, color: '#06b6d4' }} /></div>
            <div><div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151' }}>Team</div><div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{(project.currentTeamSize || 0) + 1} <span style={{ color: '#374151', fontWeight: 400 }}>/ {project.maxTeamSize || '?'}</span></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Feature & Benefit Data (Exactly as provided) ────────────────────────── */
const featureData = [
  { icon: <GitBranch style={{ width: 22, height: 22 }} />, title: 'Project Collaboration', desc: 'Built-in tools for seamless team coordination — skill matching, task boards, and real-time project tracking.', accent: '#8b5cf6', bg: 'rgba(139,92,246,0.14)' },
  { icon: <TrendingUp style={{ width: 22, height: 22 }} />, title: 'Skills Intelligence', desc: 'Track trending skills in your domain and visualize your learning trajectory with smart analytics.', accent: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  { icon: <Trophy style={{ width: 22, height: 22 }} />, title: 'Achievement System', desc: 'Earn orbit badges and build a visible portfolio with every contribution, collaboration, and completion.', accent: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  { icon: <Globe style={{ width: 22, height: 22 }} />, title: 'Galactic Network', desc: 'Connect with students across universities, domains, and disciplines in one collaborative universe.', accent: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
];

const benefitData = [
  { text: 'Showcase real projects in your public portfolio', icon: <Trophy style={{ width: 16, height: 16 }} />, color: '#f97316' },
  { text: 'Discover which skills are trending in your field', icon: <TrendingUp style={{ width: 16, height: 16 }} />, color: '#06b6d4' },
  { text: 'Build your professional network before you graduate', icon: <Globe style={{ width: 16, height: 16 }} />, color: '#22c55e' },
  { text: 'Collaborate on projects that matter beyond class', icon: <Code style={{ width: 16, height: 16 }} />, color: '#8b5cf6' },
  { text: 'Get meaningful peer feedback and skill validation', icon: <Star style={{ width: 16, height: 16 }} />, color: '#fbbf24' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING PAGE (Functionality Fixes Only)
   ═══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false); // Functional change
  const [publicData, setPublicData] = useState({ projects: [], popularSkills: [], colleges: [], userCount: 0, projectCount: 0, loading: true });

  useEffect(() => {
    // Show note if response takes > 3 seconds
    const wakeTimer = setTimeout(() => { if (publicData.loading) setIsWakingUp(true); }, 3000);

    const fetchData = async () => {
      try {
        const [projectsRes, skillsRes, collegesRes, countsRes] = await Promise.allSettled([
          projectService.getRecentProjects(),
          skillsService.getPopularSkills(0, 10, { preventRedirect: true }),
          dataService.getColleges({ preventRedirect: true }),
          dataService.getSystemCounts(),
        ]);

        clearTimeout(wakeTimer);
        setIsWakingUp(false); // Remove note when data arrives

        const getList = (res) => {
          if (res.status === 'rejected') return [];
          const v = res.value;
          return v.data?.content || v.content || v.data || [];
        };

        setPublicData({
          projects: getList(projectsRes),
          popularSkills: getList(skillsRes),
          colleges: getList(collegesRes),
          userCount: countsRes.status === 'fulfilled' ? (countsRes.value.users || 1250) : 1250,
          projectCount: countsRes.status === 'fulfilled' ? (countsRes.value.projects || 850) : 850,
          loading: false,
        });
      } catch { setPublicData(p => ({ ...p, loading: false })); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileOpen(false); };

  return (
    <div className="qx-root" style={{ minHeight: '100vh' }}>
      <ResponsiveStyles />
      <ShootingStarsCanvas />

      {/* ── COLD START NOTE (Only shows if backend is slow) ── */}
      {isWakingUp && publicData.loading && (
        <div style={{ position: 'fixed', top: 90, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: '90%', maxWidth: 460, background: 'rgba(3, 5, 13, 0.95)', border: '1px solid rgba(139, 92, 246, 0.5)', borderRadius: 16, padding: 16, backdropFilter: 'blur(12px)', display: 'flex', gap: 15, alignItems: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <Zap className="qx-loading-icon" style={{ color: '#8b5cf6' }} size={20} />
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>System is waking up...</div>
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>The backend on Render takes ~2 mins to spin up on the first visit. Hang tight!</div>
          </div>
        </div>
      )}

      {/* Nebula glows (Exactly as provided) */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-18%', left: '-12%', width: '60%', height: '55%', background: 'rgba(139,92,246,0.11)', borderRadius: '50%', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '-12%', right: '-10%', width: '50%', height: '45%', background: 'rgba(6,182,212,0.07)', borderRadius: '50%', filter: 'blur(90px)' }} />
      </div>

      {/* ── NAVBAR (Design preserved) ── */}
      <nav className="qx-layer" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(3,5,13,0.82)', backdropFilter: 'blur(22px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/Logo.png" alt="Logo" style={{ width: 36, height: 36, borderRadius: 10 }} />
            <span className="qx-syne qx-grad" style={{ fontSize: 18, fontWeight: 700 }}>Quasar</span>
          </Link>
          <div className="qx-hide-m" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', gap: 2, padding: '6px 8px', borderRadius: 40, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[['projects', 'Live Projects'], ['features', 'Features'], ['colleges', 'Universities']].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="qx-nav-link">{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/login" className="qx-hide-m"><button className="qx-btn-out" style={{ fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 9 }}>Sign In</button></Link>
            <Link to="/register"><button className="qx-shimmer" style={{ color: '#fff', fontSize: 13, fontWeight: 700, padding: '7px 16px', borderRadius: 9 }}>Join Free</button></Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="qx-show-m" style={{ display: 'none', padding: 7, borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#8892a8' }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="qx-mobile-anim" style={{ padding: '16px 24px 20px', background: 'rgba(3,5,13,0.97)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[['projects', 'Live Projects'], ['features', 'Features'], ['colleges', 'Universities']].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ textAlign: 'left', padding: '11px 0', background: 'none', border: 'none', fontSize: 14, color: '#8892a8' }}>{label}</button>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="qx-layer" style={{ paddingTop: 164, paddingBottom: 112, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <h1 className="qx-fade-up qx-d1 qx-syne" style={{ fontSize: 'clamp(38px, 7vw, 78px)', fontWeight: 700, lineHeight: 1.05, color: '#f0f4ff', marginBottom: 22 }}>
            Find teammates, <br /><span className="qx-grad">ship projects, get noticed.</span>
          </h1>
          <p className="qx-fade-up qx-d2" style={{ fontSize: 'clamp(14px, 1.8vw, 17px)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 40px', color: '#6b7280' }}>The professional collaboration platform for college students. Build a portfolio that stands out — before you ever graduate.</p>
          <div className="qx-fade-up qx-d3" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register"><button className="qx-btn-out" style={{ color: '#fff', fontSize: 15, fontWeight: 700, padding: '13px 34px', borderRadius: 40 }}>Launch your orbit.</button></Link>
            <Link to="/login"><button className="qx-btn-out" style={{ fontSize: 15, fontWeight: 600, padding: '13px 28px', borderRadius: 40 }}>Login</button></Link>
          </div>
        </div>
      </section>

      {/* ── STATS (Responsive grid applied) ── */}
      <section className="qx-layer qx-section-alt" style={{ padding: '52px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="qx-r2">
            {[
              { label: 'Active Students', value: publicData.userCount > 0 ? `${publicData.userCount.toLocaleString()}+` : '1,250+', color: '#8b5cf6', icon: <Users size={20} /> },
              { label: 'Projects Launched', value: publicData.projectCount > 0 ? `${publicData.projectCount.toLocaleString()}+` : '850+', color: '#06b6d4', icon: <Rocket size={20} /> },
              { label: 'Universities', value: `${publicData.colleges.length || 50}+`, color: '#f97316', icon: <Building2 size={20} /> },
              { label: 'Success Rate', value: '98%', color: '#22c55e', icon: <Trophy size={20} /> },
            ].map((s, i) => (
              <div key={i} className="qx-glass qx-stat" style={{ borderRadius: 18, padding: '22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div className="qx-syne" style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#374151', marginTop: 5 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" className="qx-layer" style={{ padding: '100px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <h2 className="qx-syne" style={{ fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 700, color: '#f0f4ff' }}>What Students Are Building</h2>
          </div>
        </div>
        <div className="qx-mqwrap">
          <div className="qx-mqtrack" style={{ padding: '12px 0', gap: 20 }}>
            {publicData.projects.map((p, i) => (<ProjectCard key={i} project={p} isMarquee={window.innerWidth > 768} />))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="qx-layer qx-section-alt" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 className="qx-syne" style={{ textAlign: 'center', fontSize: 'clamp(24px, 3.5vw, 44px)', fontWeight: 700, color: '#f0f4ff', marginBottom: 64 }}>Built for Student Success</h2>
          <div className="qx-r2">
            {featureData.map((f, i) => (
              <div key={i} className="qx-glass qx-lift" style={{ borderRadius: 22, padding: 30, position: 'relative' }}>
                <div className="qx-accent-bar" />
                <div style={{ width: 52, height: 52, borderRadius: 16, background: f.bg, color: f.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>{f.icon}</div>
                <h3 className="qx-syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#f0f4ff' }}>{f.title}</h3>
                <p style={{ fontSize: 12, lineHeight: 1.7, color: '#4b5563' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS (Responsive split applied) ── */}
      <section className="qx-layer" style={{ padding: '100px 24px' }}>
        <div className="qx-r1" style={{ maxWidth: 1280, margin: '0 auto', alignItems: 'center' }}>
          <div>
            <h2 className="qx-syne" style={{ fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 700, color: '#f0f4ff', marginBottom: 28 }}>Your launchpad to a <br /><span className="qx-grad-warm">remarkable career.</span></h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {benefitData.map((b, i) => (
                <div key={i} className="qx-benefit" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${b.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: b.color }}>{b.icon}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src="/Logo.png" alt="Logo" style={{ width: 210, filter: 'drop-shadow(0 0 44px rgba(139,92,246,0.45))' }} />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="qx-footer qx-layer" style={{ padding: '58px 24px 34px', background: 'rgba(3,5,13,0.95)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="qx-r1">
            <div>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
                <img src="/Logo.png" alt="Logo" style={{ width: 34, height: 34, borderRadius: 9 }} />
                <span className="qx-syne qx-grad" style={{ fontSize: 16, fontWeight: 700 }}>Quasar</span>
              </Link>
              <p style={{ fontSize: 13, color: '#374151' }}>Built with ❤️ for students.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}