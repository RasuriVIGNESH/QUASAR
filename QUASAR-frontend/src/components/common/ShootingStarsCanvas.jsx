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
    let rafId;
    let lastTime = 0;

    const FPS = 30; // ✅ limit FPS
    const interval = 1000 / FPS;

    let nextShoot = 0;
    const tw = [];
    const sw = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ✅ REDUCED stars (220 → 80)
    for (let i = 0; i < 80; i++) {
      tw.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.2 + 0.2,
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.002 + 0.0005,
      });
    }

    const spawnShooter = () => {
      const [sc, tc] = COLORS[Math.floor(Math.random() * COLORS.length)];
      const spd = Math.random() * 5 + 4; // slower
      const ang = (Math.random() * 25 + 15) * (Math.PI / 180);

      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.4,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        len: Math.random() * 80 + 40,
        sc, tc,
        life: 0,
        max: Math.random() * 50 + 40,
      };
    };

    const draw = (time) => {

      // ✅ FPS throttle
      if (time - lastTime < interval) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      lastTime = time;

      // ✅ pause when tab inactive
      if (document.hidden) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Twinkling stars
      for (const s of tw) {
        ctx.globalAlpha = 0.2 + 0.5 * (0.5 + 0.5 * Math.sin(time * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // spawn slower
      if (time > nextShoot) {
        sw.push(spawnShooter());
        nextShoot = time + Math.random() * 3000 + 1500;
      }

      for (let i = sw.length - 1; i >= 0; i--) {
        const s = sw[i];
        const p = s.life / s.max;
        const a = Math.max(0, p < 0.3 ? p / 0.3 : 1 - (p - 0.3) / 0.7);

        const mag = Math.hypot(s.vx, s.vy);
        const tx = s.x - (s.vx / mag) * s.len;
        const ty = s.y - (s.vy / mag) * s.len;

        const grad = ctx.createLinearGradient(tx, ty, s.x, s.y);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.7, s.tc + '55');
        grad.addColorStop(1, s.sc);

        ctx.save();
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5; // lighter
        ctx.stroke();

        s.x += s.vx;
        s.y += s.vy;
        s.life++;

        if (s.life >= s.max) {
          sw.splice(i, 1);
        }

        ctx.restore();
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
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}