import React, { useRef, useEffect } from 'react';

const COLORS = [
  ['#9E00FF', '#2EB9DF'],
  ['#FF0099', '#FFB800'],
  ['#00FF9E', '#00B8FF'],
  ['#f97316', '#8b5cf6'],
];

export default function ShootingStarsCanvas() {
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
}
