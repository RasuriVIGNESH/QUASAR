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




/* ─── Shooting Stars Canvas ──────────────────────────────────────────────── */
const ShootingStarsCanvas = () => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId, nextShoot = 0;
    const tw = [];   // twinkling background stars
    const sw = [];   // shooting stars

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Seed static twinkling stars
    for (let i = 0; i < 220; i++) {
      tw.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.1,
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.002 + 0.0007,
      });
    }

    const COLORS = [
      ['#9E00FF', '#2EB9DF'],
      ['#FF0099', '#FFB800'],
      ['#00FF9E', '#00B8FF'],
      ['#f97316', '#8b5cf6'],
    ];

    const spawnShooter = () => {
      const [sc, tc] = COLORS[Math.floor(Math.random() * COLORS.length)];
      const spd = Math.random() * 7 + 5;
      const ang = (Math.random() * 28 + 14) * (Math.PI / 180);
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.45,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        len: Math.random() * 110 + 55,
        sc, tc,
        life: 0,
        max: Math.random() * 65 + 45,
      };
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Twinkling stars
      for (const s of tw) {
        ctx.globalAlpha = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Spawn
      if (t > nextShoot) {
        sw.push(spawnShooter());
        nextShoot = t + Math.random() * 2400 + 650;
      }

      // Draw shooting stars
      for (let i = sw.length - 1; i >= 0; i--) {
        const s = sw[i];
        const p = s.life / s.max;
        const a = Math.max(0, p < 0.3 ? p / 0.3 : 1 - (p - 0.3) / 0.7);
        const mag = Math.hypot(s.vx, s.vy);
        const tx = s.x - (s.vx / mag) * s.len;
        const ty = s.y - (s.vy / mag) * s.len;

        const grad = ctx.createLinearGradient(tx, ty, s.x, s.y);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.65, s.tc + '55');
        grad.addColorStop(1, s.sc);

        ctx.save();
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Head glow
        const hg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 8);
        hg.addColorStop(0, s.sc);
        hg.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = hg;
        ctx.fill();
        ctx.restore();

        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        if (s.life >= s.max || s.x > canvas.width + 120 || s.y > canvas.height + 120) {
          sw.splice(i, 1);
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
      }}
    />
  );
};

/* ─── Project Card ───────────────────────────────────────────────────────── */
const ProjectCard = ({ project, isMarquee = false }) => {
  const lead = project.lead || {};
  const leadName = `${lead.firstName || 'Unknown'} ${lead.lastName && lead.lastName !== '---' ? lead.lastName : ''
    }`.trim();
  const skills = project.requiredSkills?.map(s => s.skill) || project.skills || [];
  const startDate = project.expectedStartDate
    ? new Date(project.expectedStartDate).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    })
    : 'TBD';

  return (
    <div
      className="qx-glass qx-lift"
      style={{
        borderRadius: 20, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', position: 'relative',
        width: isMarquee ? 364 : '100%',
        flexShrink: isMarquee ? 0 : 'unset',
      }}
    >
      <div className="qx-accent-bar" />

      <div style={{ padding: '22px 22px 0' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
          <div>
            <span
              className="qx-pill"
              style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 8 }}
            >
              {project.categoryName || 'Project'}
            </span>
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35, color: '#f0f4ff', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
              {project.title}
            </div>
          </div>
          <span className={project.status === 'RECRUITING' ? 'tag-recruiting' : 'tag-default'} style={{ flexShrink: 0 }}>
            {project.status || 'Active'}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p style={{ fontSize: 13, lineHeight: 1.65, color: '#6b7280', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 12 }}>
            {project.description}
          </p>
        )}

        {/* Goals */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', marginBottom: 4 }}>Goals</div>
          <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.6, color: '#cbd5e1', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {project.goals || 'No specific goals listed.'}
          </p>
        </div>

        {/* Skills */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Sparkles style={{ width: 10, height: 10, color: '#f97316' }} /> Required Skills
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {skills.slice(0, 5).map((s, i) => (
              <span key={i} className="qx-skill" style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>
                {s.name || (typeof s === 'string' ? s : 'Skill')}
              </span>
            ))}
            {skills.length > 5 && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#4b5563' }}>
                +{skills.length - 5}
              </span>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />
      </div>

      {/* Card footer */}
      <div style={{ padding: '0 22px 20px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: '#374151', fontWeight: 500 }}>Lead</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 10px 4px 5px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', background: '#1e1a3d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
              {lead.profilePictureUrl
                ? <img src={lead.profilePictureUrl} alt={leadName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: '#8b5cf6' }}>{lead.firstName?.[0] || 'U'}</span>
              }
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {leadName}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ padding: 5, borderRadius: 7, background: 'rgba(139,92,246,0.14)' }}>
              <Calendar style={{ width: 12, height: 12, color: '#8b5cf6' }} />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151' }}>Start</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{startDate}</div>
            </div>
          </div>
          <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, borderLeft: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ padding: 5, borderRadius: 7, background: 'rgba(6,182,212,0.12)' }}>
              <Users style={{ width: 12, height: 12, color: '#06b6d4' }} />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151' }}>Team</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>
                {(project.currentTeamSize || 0) + 1}{' '}
                <span style={{ color: '#374151', fontWeight: 400 }}>/ {project.maxTeamSize || '?'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Feature & Benefit Data ─────────────────────────────────────────────── */
const featureData = [
  {
    icon: <GitBranch style={{ width: 22, height: 22 }} />,
    title: 'Project Collaboration',
    desc: 'Built-in tools for seamless team coordination — skill matching, task boards, and real-time project tracking.',
    accent: '#8b5cf6', bg: 'rgba(139,92,246,0.14)',
  },
  {
    icon: <TrendingUp style={{ width: 22, height: 22 }} />,
    title: 'Skills Intelligence',
    desc: 'Track trending skills in your domain and visualize your learning trajectory with smart analytics.',
    accent: '#06b6d4', bg: 'rgba(6,182,212,0.12)',
  },
  {
    icon: <Trophy style={{ width: 22, height: 22 }} />,
    title: 'Achievement System',
    desc: 'Earn orbit badges and build a visible portfolio with every contribution, collaboration, and completion.',
    accent: '#f97316', bg: 'rgba(249,115,22,0.12)',
  },
  {
    icon: <Globe style={{ width: 22, height: 22 }} />,
    title: 'Galactic Network',
    desc: 'Connect with students across universities, domains, and disciplines in one collaborative universe.',
    accent: '#22c55e', bg: 'rgba(34,197,94,0.12)',
  },
];

const benefitData = [
  { text: 'Showcase real projects in your public portfolio', icon: <Trophy style={{ width: 16, height: 16 }} />, color: '#f97316' },
  { text: 'Discover which skills are trending in your field', icon: <TrendingUp style={{ width: 16, height: 16 }} />, color: '#06b6d4' },
  { text: 'Build your professional network before you graduate', icon: <Globe style={{ width: 16, height: 16 }} />, color: '#22c55e' },
  { text: 'Collaborate on projects that matter beyond class', icon: <Code style={{ width: 16, height: 16 }} />, color: '#8b5cf6' },
  { text: 'Get meaningful peer feedback and skill validation', icon: <Star style={{ width: 16, height: 16 }} />, color: '#fbbf24' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [publicData, setPublicData] = useState({
    projects: [], popularSkills: [], colleges: [],
    userCount: 0, projectCount: 0, loading: true,
  });

  /* ── Data fetch (same API calls as original) ── */
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
          const v = res.value;
          if (Array.isArray(v)) return v;
          return v.data?.content || v.content || v.data || [];
        };
        setPublicData({
          projects: getList(projectsRes),
          popularSkills: getList(skillsRes),
          colleges: getList(collegesRes),
          userCount: countsRes.status === 'fulfilled'
            ? (Array.isArray(countsRes.value) ? (countsRes.value[0] || 0) : (countsRes.value.users || 1250))
            : 1250,
          projectCount: countsRes.status === 'fulfilled'
            ? (Array.isArray(countsRes.value) ? (countsRes.value[1] || 0) : (countsRes.value.projects || 850))
            : 850,
          loading: false,
        });
      } catch {
        setPublicData(p => ({ ...p, loading: false }));
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <div className="qx-root" style={{ minHeight: '100vh' }}>
      {/* Fixed background layers */}
      <ShootingStarsCanvas />

      {/* Nebula glow orbs (fixed, sit above canvas, behind content) */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-18%', left: '-12%', width: '60%', height: '55%', background: 'rgba(139,92,246,0.11)', borderRadius: '50%', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '-12%', right: '-10%', width: '50%', height: '45%', background: 'rgba(6,182,212,0.07)', borderRadius: '50%', filter: 'blur(90px)' }} />
        <div style={{ position: 'absolute', top: '38%', left: '25%', width: '40%', height: '32%', background: 'rgba(249,115,22,0.05)', borderRadius: '50%', filter: 'blur(80px)' }} />
      </div>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav
        className="qx-layer"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(3,5,13,0.82)', backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          transition: 'all 0.3s',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
              <div style={{ position: 'absolute', inset: -4, borderRadius: 14, background: 'rgba(139,92,246,0.28)', filter: 'blur(10px)' }} />
              <img src="/Logo.png" alt="Quasar Logo" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', position: 'relative' }} />
            </div>
            <span className="qx-syne qx-grad" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Quasar</span>
          </Link>

          {/* Desktop nav pill — centered */}
          <div
            className="qx-hide-m"
            style={{
              position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
              display: 'flex', alignItems: 'center', gap: 2,
              padding: '6px 8px', borderRadius: 40,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {[['projects', 'Live Projects'], ['features', 'Features'], ['colleges', 'Universities']].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="qx-nav-link">{label}</button>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/login" className="qx-hide-m" style={{ textDecoration: 'none' }}>
              <button className="qx-btn-out" style={{ fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 9 }}>Sign In</button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="qx-shimmer" style={{ color: '#fff', fontSize: 13, fontWeight: 700, padding: '7px 16px', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 6 }}>
                Join Free <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
            </Link>
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="qx-show-m"
              style={{ padding: 7, borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#8892a8' }}
              aria-label="Menu"
            >
              {mobileOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            className="qx-mobile-anim"
            style={{ padding: '16px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(3,5,13,0.97)', display: 'flex', flexDirection: 'column', gap: 4 }}
          >
            {[['projects', 'Live Projects'], ['features', 'Features'], ['colleges', 'Universities']].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ textAlign: 'left', padding: '11px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#8892a8', fontFamily: 'Inter, sans-serif' }}>
                {label}
              </button>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <Link to="/login" style={{ flex: 1, textDecoration: 'none' }}>
                <button className="qx-btn-out" style={{ width: '100%', padding: '11px', borderRadius: 9, fontSize: 13, fontWeight: 600 }}>Sign In</button>
              </Link>
              <Link to="/register" style={{ flex: 1, textDecoration: 'none' }}>
                <button className="qx-shimmer" style={{ width: '100%', color: '#fff', padding: '11px', borderRadius: 9, fontSize: 13, fontWeight: 700 }}>Join Free</button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section
        className="qx-layer"
        style={{
          paddingTop: 164, paddingBottom: 112,
          minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

          {/* Headline */}
          <h1
            className="qx-fade-up qx-d1 qx-syne"
            style={{ fontSize: 'clamp(38px, 7vw, 78px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 22, color: '#f0f4ff' }}
          >
            Find teammates, <br />
            <span className="qx-grad">ship projects, get noticed.</span>
          </h1>

          <p
            className="qx-fade-up qx-d2"
            style={{ fontSize: 'clamp(14px, 1.8vw, 17px)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 40px', color: '#6b7280' }}
          >
            The professional collaboration platform for college students.
            Find teammates by skill, launch real projects, and build a portfolio
            that stands out — before you ever graduate.
          </p>

          {/* CTAs */}
          <div
            className="qx-fade-up qx-d3"
            style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}
          >
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="qx-btn-out" style={{ color: '#fff', fontSize: 15, fontWeight: 700, padding: '13px 34px', borderRadius: 40, display: 'flex', alignItems: 'center', gap: 9 }}>
                Launch your orbit.
              </button>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="qx-btn-out" style={{ fontSize: 15, fontWeight: 600, padding: '13px 28px', borderRadius: 40, display: 'flex', alignItems: 'center', gap: 8 }}>
                Login <ChevronRight style={{ width: 17, height: 17 }} />
              </button>
            </Link>
          </div>

          {/* Trust row */}
          <div
            className="qx-fade-up qx-d4"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11, fontSize: 12, color: '#4b5563', flexWrap: 'wrap' }}
          >
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────── */}
      <section className="qx-layer qx-section-alt" style={{ padding: '52px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="qx-r2">
            {[
              { label: 'Active Students', value: publicData.userCount > 0 ? `${publicData.userCount.toLocaleString()}+` : '1,250+', color: '#8b5cf6', icon: <Users style={{ width: 20, height: 20 }} /> },
              { label: 'Projects Launched', value: publicData.projectCount > 0 ? `${publicData.projectCount.toLocaleString()}+` : '850+', color: '#06b6d4', icon: <Rocket style={{ width: 20, height: 20 }} /> },
              { label: 'Universities', value: `${publicData.colleges.length || 50}+`, color: '#f97316', icon: <Building2 style={{ width: 20, height: 20 }} /> },
              { label: 'Success Rate', value: '98%', color: '#22c55e', icon: <Trophy style={{ width: 20, height: 20 }} /> },
            ].map((s, i) => (
              <div
                key={i}
                className="qx-glass qx-stat"
                style={{ borderRadius: 18, padding: '22px', display: 'flex', alignItems: 'center', gap: 16 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}55`; e.currentTarget.style.boxShadow = `0 0 28px ${s.color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0, boxShadow: `0 0 18px ${s.color}28` }}>
                  {s.icon}
                </div>
                <div>
                  <div className="qx-syne" style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#374151', marginTop: 5 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROJECTS ──────────────────────────────────────────── */}
      {publicData.projects.length > 0 && (
        <section id="projects" className="qx-layer" style={{ padding: '100px 0' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', marginBottom: 44 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div className="qx-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 14 }}>
                  <Rocket style={{ width: 11, height: 11 }} /> Live Projects
                </div>
                <h2 className="qx-syne" style={{ fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 700, lineHeight: 1.1, color: '#f0f4ff' }}>
                  What Students Are Building
                </h2>
                <p style={{ fontSize: 14, color: '#4b5563', marginTop: 10 }}>Real projects, real teams, real impact.</p>
              </div>
              <Link
                to="/login"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#a78bfa', textDecoration: 'none', transition: 'gap 0.15s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.gap = '11px'}
                onMouseLeave={e => e.currentTarget.style.gap = '6px'}
              >
                View all projects <ArrowRight style={{ width: 15, height: 15 }} />
              </Link>
            </div>
          </div>

          {publicData.projects.length > 3 ? (
            <div className="qx-mqwrap" style={{ padding: '8px 0' }}>
              {/* Edge fades */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 110, background: 'linear-gradient(to right, #03050d, transparent)', zIndex: 2, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 110, background: 'linear-gradient(to left, #03050d, transparent)', zIndex: 2, pointerEvents: 'none' }} />
              <div className="qx-mqtrack" style={{ padding: '12px 0', gap: 20 }}>
                {[...publicData.projects, ...publicData.projects].map((project, i) => (
                  <ProjectCard key={i} project={project} isMarquee />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {publicData.projects.map((project, i) => (
                <ProjectCard key={i} project={project} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── FEATURES GRID ──────────────────────────────────────────────── */}
      <section id="features" className="qx-layer qx-section-alt" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>

            <h2 className="qx-syne" style={{ fontSize: 'clamp(24px, 3.5vw, 44px)', fontWeight: 700, lineHeight: 1.08, color: '#f0f4ff', marginBottom: 14 }}>
              Built for Student Success
            </h2>
            <p style={{ fontSize: 14, color: '#4b5563', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Everything you need to find the right team, grow your skills, and ship work that matters.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="qx-r2">
            {featureData.map((f, i) => (
              <div key={i} className="qx-glass qx-lift" style={{ borderRadius: 22, padding: 30, position: 'relative', overflow: 'hidden' }}>
                <div className="qx-accent-bar" />
                <div className="qx-ghost-num">{String(i + 1).padStart(2, '0')}</div>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: f.bg, color: f.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, boxShadow: `0 0 22px ${f.accent}28` }}>
                  {f.icon}
                </div>
                <h3 className="qx-syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#f0f4ff' }}>{f.title}</h3>
                <p style={{ fontSize: 12, lineHeight: 1.7, color: '#4b5563' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS + LOGO VISUAL ─────────────────────────────────────── */}
      <section className="qx-layer" style={{ padding: '100px 24px' }}>
        <div
          style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}
          className="qx-r1"
        >
          {/* Left: Benefits */}
          <div>
            <div className="qx-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 20 }}>
              <Star style={{ width: 12, height: 12 }} /> Why Students Love Quasar
            </div>
            <h2 className="qx-syne" style={{ fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 700, lineHeight: 1.1, color: '#f0f4ff', marginBottom: 28 }}>
              Your launchpad to a<br />
              <span className="qx-grad-warm">remarkable career.</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {benefitData.map((b, i) => (
                <div key={i} className="qx-benefit" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${b.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: b.color, flexShrink: 0 }}>
                    {b.icon}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.4 }}>{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Logo visual with orbit cards */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', padding: 48 }}>
              {/* Outer nebula glow */}
              <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
              {/* Spinning orbit ring */}
              <div className="qx-orbit-ring" />

              {/* Projects card */}
              <div
                className="qx-float"
                style={{ position: 'absolute', top: 12, right: -52, background: 'rgba(3,5,13,0.92)', backdropFilter: 'blur(18px)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(139,92,246,0.22)' }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GitBranch style={{ width: 14, height: 14, color: '#8b5cf6' }} />
                </div>
                <div>
                  <div className="qx-syne" style={{ fontSize: 16, fontWeight: 800, color: '#8b5cf6' }}>{publicData.projectCount > 0 ? `${publicData.projectCount}+` : '850+'}</div>
                  <div style={{ fontSize: 11, color: '#374151' }}>Projects</div>
                </div>
              </div>

              {/* Students card */}
              <div
                style={{ position: 'absolute', bottom: 22, left: -56, background: 'rgba(3,5,13,0.92)', backdropFilter: 'blur(18px)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(6,182,212,0.22)', animation: 'float 4.5s 1.1s ease-in-out infinite' }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(6,182,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users style={{ width: 14, height: 14, color: '#06b6d4' }} />
                </div>
                <div>
                  <div className="qx-syne" style={{ fontSize: 16, fontWeight: 800, color: '#06b6d4' }}>{publicData.userCount > 0 ? `${publicData.userCount}+` : '1,250+'}</div>
                  <div style={{ fontSize: 11, color: '#374151' }}>Students</div>
                </div>
              </div>

              {/* Central logo */}
              <img
                src="/Logo.png"
                alt="Quasar Logo"
                className="qx-float"
                style={{
                  width: 210, height: 210, objectFit: 'contain', position: 'relative', zIndex: 1,
                  filter: 'drop-shadow(0 0 44px rgba(139,92,246,0.45)) drop-shadow(0 0 90px rgba(6,182,212,0.15))',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── POPULAR SKILLS ─────────────────────────────────────────────── */}
      {publicData.popularSkills.length > 0 && (
        <section className="qx-layer qx-section-alt" style={{ padding: '68px 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em', color: '#374151', marginBottom: 8 }}>
              Trending on the Platform
            </div>
            <h3 className="qx-syne" style={{ fontSize: 22, fontWeight: 700, color: '#f0f4ff', marginBottom: 28 }}>Skills in Demand</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {publicData.popularSkills.map((skill, i) => (
                <span key={i} className="qx-skill" style={{ fontSize: 12, fontWeight: 600, padding: '8px 18px', borderRadius: 26 }}>
                  {skill.name || skill}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── INSTITUTIONAL TRUST ────────────────────────────────────────── */}
      {publicData.colleges.length > 0 && (
        <section id="colleges" className="qx-layer" style={{ padding: '76px 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em', color: '#374151', marginBottom: 8 }}>
              Our Universe of Institutions
            </div>
            <h3 className="qx-syne" style={{ fontSize: 22, fontWeight: 700, color: '#f0f4ff', marginBottom: 30 }}>Trusted by students from</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              {publicData.colleges.slice(0, 8).map((college, i) => (
                <div key={i} className="qx-college" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 30, fontSize: 13, fontWeight: 600 }}>
                  <Building2 style={{ width: 14, height: 14 }} />
                  {college.name}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ─────────────────────────────────────────────────── */}
      <section className="qx-layer qx-section-alt" style={{ padding: '108px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div className="qx-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 600, marginBottom: 26 }}>
            <Sparkles style={{ width: 13, height: 13 }} /> Ready to launch?
          </div>
          <h2
            className="qx-syne"
            style={{ fontSize: 'clamp(28px, 4.5vw, 52px)', fontWeight: 700, lineHeight: 1.06, color: '#f0f4ff', marginBottom: 16, letterSpacing: '-0.02em' }}
          >
            Your next chapter<br />
            <span className="qx-grad">starts in orbit.</span>
          </h2>
          <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 38px' }}>
            Join thousands of students already connecting, collaborating, and building impressive portfolios on Quasar.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="qx-shimmer" style={{ color: '#fff', fontSize: 15, fontWeight: 700, padding: '13px 36px', borderRadius: 40, display: 'flex', alignItems: 'center', gap: 8 }}>
                Get Started Free <ArrowRight style={{ width: 18, height: 18 }} />
              </button>
            </Link>
            <Link to="/projects" style={{ textDecoration: 'none' }}>
              <button className="qx-btn-out" style={{ fontSize: 15, fontWeight: 600, padding: '13px 28px', borderRadius: 40 }}>
                Browse Projects
              </button>
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 26, marginTop: 38, flexWrap: 'wrap' }}>
            {['Free to join', 'No credit card', 'Open to all colleges'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
                <CheckCircle style={{ width: 14, height: 14, color: '#22c55e' }} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="qx-footer qx-layer" style={{ padding: '58px 24px 34px', background: 'rgba(3,5,13,0.95)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }} className="qx-r1">

            {/* Brand */}
            <div>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
                <img src="/Logo.png" alt="Quasar Logo" style={{ width: 34, height: 34, borderRadius: 9, objectFit: 'cover' }} />
                <span className="qx-syne qx-grad" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>Quasar</span>
              </Link>
              <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 300, marginBottom: 14, color: '#374151' }}>
                The collaboration platform for college students to connect, share skills, and build a professional portfolio together.
              </p>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>Built with ❤️ for students.</p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="qx-syne" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#e2e8f0', marginBottom: 20 }}>Platform</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['Sign In', '/login'], ['Register', '/register'], ['Browse Projects', '/projects']].map(([l, to]) => (
                  <Link key={l} to={to} style={{ fontSize: 14 }}>{l}</Link>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="qx-syne" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#e2e8f0', marginBottom: 20 }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['Help Center', '#'], ['Privacy Policy', '#'], ['Terms of Service', '#']].map(([l, to]) => (
                  <Link key={l} to={to} style={{ fontSize: 14 }}>{l}</Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#374151' }}>© 2025 Quasar. Built with ❤️ for students.</span>
            <div style={{ display: 'flex', gap: 22 }}>
              {['Twitter', 'LinkedIn', 'GitHub'].map(l => (
                <a key={l} href="#" style={{ fontSize: 12, fontWeight: 500 }}
                  onMouseEnter={e => e.target.style.color = '#a78bfa'}
                  onMouseLeave={e => e.target.style.color = ''}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── SCROLL TO TOP ───────────────────────────────────────────────── */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="qx-scroll-top"
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 50,
            width: 46, height: 46, borderRadius: '50%',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Scroll to top"
        >
          <ArrowUp style={{ width: 20, height: 20, color: '#fff' }} />
        </button>
      )}
    </div>
  );
}