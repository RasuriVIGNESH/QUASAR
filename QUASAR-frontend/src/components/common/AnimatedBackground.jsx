import React, { useRef, useEffect, useMemo } from 'react';
import { useCursor } from '../../contexts/CursorContext';

// Words representing the Quasar platform themes
const MARQUEE_WORDS = [
    'COLLABORATE • INNOVATE • CONNECT • BUILD • DISCOVER • LEARN • CREATE • NETWORK •',
    'PROJECTS • SKILLS • TEAMWORK • PORTFOLIO • GROWTH • ENGINEERING • RESEARCH •',
    'QUASAR • STUDENTS • MENTORS • COMMUNITY • HACKATHONS • OPEN SOURCE • DESIGN •',
    'ACHIEVEMENT • PROGRESS • EXCELLENCE • KNOWLEDGE • DEVELOPMENT • LEADERSHIP •',
];

const MARQUEE_CONFIG = [
    { direction: 'left', duration: 140, opacity: 0.022 },
    { direction: 'right', duration: 180, opacity: 0.018 },
    { direction: 'left', duration: 160, opacity: 0.025 },
    { direction: 'right', duration: 200, opacity: 0.028 },
];

function GradientCanvas() {
    const canvasRef = useRef(null);
    const cursor = useCursor();
    const cursorRef = useRef({ x: 0.5, y: 0.5 });
    const animRef = useRef(null);

    useEffect(() => {
        cursorRef.current = {
            x: cursor.normalizedX,
            y: cursor.normalizedY,
        };
    }, [cursor.normalizedX, cursor.normalizedY]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Blob configuration
        const blobs = [
            { // Indigo
                color: [99, 102, 241],
                radius: 0.35,
                cx: 0.25, cy: 0.3,
                freqX: 0.0003, freqY: 0.0004,
                ampX: 0.15, ampY: 0.12,
                alpha: 0.12,
            },
            { // Muted Violet
                color: [139, 92, 246],
                radius: 0.3,
                cx: 0.7, cy: 0.25,
                freqX: 0.00025, freqY: 0.00035,
                ampX: 0.12, ampY: 0.15,
                alpha: 0.08,
            },
            { // Soft Blue
                color: [56, 189, 248],
                radius: 0.28,
                cx: 0.6, cy: 0.7,
                freqX: 0.00035, freqY: 0.00025,
                ampX: 0.18, ampY: 0.1,
                alpha: 0.06,
            },
            { // Warm Accent
                color: [167, 139, 250],
                radius: 0.25,
                cx: 0.3, cy: 0.75,
                freqX: 0.0002, freqY: 0.0003,
                ampX: 0.1, ampY: 0.14,
                alpha: 0.07,
            },
        ];

        let startTime = performance.now();

        const draw = (timestamp) => {
            const elapsed = timestamp - startTime;
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);

            // Micro-parallax offset from cursor
            const parallaxX = (cursorRef.current.x - 0.5) * 30;
            const parallaxY = (cursorRef.current.y - 0.5) * 30;

            for (const blob of blobs) {
                const x = (blob.cx + Math.sin(elapsed * blob.freqX) * blob.ampX) * w + parallaxX;
                const y = (blob.cy + Math.cos(elapsed * blob.freqY) * blob.ampY) * h + parallaxY;
                const r = blob.radius * Math.min(w, h);

                const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
                gradient.addColorStop(0, `rgba(${blob.color.join(',')}, ${blob.alpha})`);
                gradient.addColorStop(0.5, `rgba(${blob.color.join(',')}, ${blob.alpha * 0.4})`);
                gradient.addColorStop(1, `rgba(${blob.color.join(',')}, 0)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }

            animRef.current = requestAnimationFrame(draw);
        };

        animRef.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
            }}
            aria-hidden="true"
        />
    );
}

function MarqueeBand({ text, direction, duration, opacity }) {
    const content = `${text} ${text} ${text} ${text}`;

    return (
        <div
            style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                width: '100%',
                opacity: opacity,
                userSelect: 'none',
            }}
            aria-hidden="true"
        >
            <div
                style={{
                    display: 'inline-block',
                    animation: `${direction === 'left' ? 'marquee-left' : 'marquee-right'} ${duration}s linear infinite`,
                    fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
                    fontSize: 'clamp(3rem, 8vw, 7rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    color: 'var(--text-bright)',
                    lineHeight: 1.2,
                }}
            >
                {content}
            </div>
        </div>
    );
}

export default function AnimatedBackground() {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -2,
                overflow: 'hidden',
                pointerEvents: 'none',
            }}
            aria-hidden="true"
        >
            {/* Gradient Canvas Layer */}
            <GradientCanvas />

            {/* Static Grain Overlay */}
            <div className="grain-overlay" style={{ zIndex: 1 }} />

            {/* Flowing Typography Marquee Layer */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    zIndex: 0,
                    padding: '5vh 0',
                }}
            >
                {MARQUEE_WORDS.map((text, i) => (
                    <MarqueeBand
                        key={i}
                        text={text}
                        direction={MARQUEE_CONFIG[i].direction}
                        duration={MARQUEE_CONFIG[i].duration}
                        opacity={MARQUEE_CONFIG[i].opacity}
                    />
                ))}
            </div>
        </div>
    );
}
