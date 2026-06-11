import React, { useRef, useEffect } from 'react';

const COLORS = [
  ['#9E00FF', '#2EB9DF'],
  ['#FF0099', '#FFB800'],
  ['#00FF9E', '#00B8FF'],
  ['#f97316', '#8b5cf6'],
  ['#ffffff', '#4f46e5'], // Added a bright white-indigo combo
];

export default function ShootingStarsCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let rafId;
    let lastTime = 0;

    const FPS = 30;
    const interval = 1000 / FPS;

    let nextShoot = 0;
    const twinklingStars = [];
    const shootingStars = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // ✅ INCREASED STAR DENSITY (Back to 280 for a rich background)
    const starCount = 280;
    for (let i = 0; i < starCount; i++) {
      twinklingStars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.3 + 0.2, // Slightly larger variance
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.002 + 0.0005,
      });
    }

    const spawnShooter = () => {
      const [sc, tc] = COLORS[Math.floor(Math.random() * COLORS.length)];
      const spd = Math.random() * 7 + 5; // Faster, more dynamic
      const ang = (Math.random() * 30 + 10) * (Math.PI / 180); // Varied angles

      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        len: Math.random() * 120 + 60, // Longer trails
        sc, tc,
        life: 0,
        max: Math.random() * 40 + 30, // Shorter life for snappier movement
      };
    };

    const draw = (time) => {
      // Safety check for first frame
      if (!time) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      // ✅ FPS throttle
      if (time - lastTime < interval) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      lastTime = time;

      // ✅ Pause when tab is inactive to save GPU
      if (document.hidden) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Twinkling Background Stars
      for (const s of twinklingStars) {
        // Subtle alpha breathing effect
        const alpha = 0.15 + 0.45 * (0.5 + 0.5 * Math.sin(time * s.sp + s.ph));
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 2. Spawn Shooting Stars more frequently
      // ✅ SPAWN RATE INCREASED (Every 0.4s to 1.2s)
      if (time > nextShoot) {
        shootingStars.push(spawnShooter());
        nextShoot = time + Math.random() * 800 + 400;
      }

      // 3. Draw and Update Shooting Stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];

        // Non-finite safety check
        if (!isFinite(s.x) || !isFinite(s.y)) {
          shootingStars.splice(i, 1);
          continue;
        }

        const p = s.life / s.max;
        // Smooth fade in and out
        const a = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;

        const mag = Math.hypot(s.vx, s.vy);
        const tx = s.x - (s.vx / mag) * s.len;
        const ty = s.y - (s.vy / mag) * s.len;

        const grad = ctx.createLinearGradient(tx, ty, s.x, s.y);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, s.tc + '66'); // Middle glow
        grad.addColorStop(1, s.sc);

        ctx.save();
        ctx.globalAlpha = Math.max(0, a);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2; // Slightly thicker for visibility
        ctx.lineCap = 'round';
        ctx.stroke();

        // Update positions
        s.x += s.vx;
        s.y += s.vy;
        s.life++;

        // Remove if dead
        if (s.life >= s.max) {
          shootingStars.splice(i, 1);
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
        // Enable hardware acceleration
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    />
  );
}