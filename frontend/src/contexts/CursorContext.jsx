import React, { createContext, useContext, useEffect, useRef } from 'react';

const CursorContext = createContext(null);

export function useCursor() {
    return useContext(CursorContext);
}

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

export function CursorProvider({ children }) {
    const cursorRef = useRef({
        x: 0,
        y: 0,
        normalizedX: 0.5,
        normalizedY: 0.5,
    });

    const targetRef = useRef({ x: 0, y: 0 });
    const primaryRef = useRef({ x: 0, y: 0 });
    const trailRef = useRef({ x: 0, y: 0 });

    const primaryGlowRef = useRef(null);
    const trailGlowRef = useRef(null);

    const rafRef = useRef(null);

    // ✅ NO STATE → NO RE-RENDER
    useEffect(() => {
        const handleMouseMove = (e) => {
            targetRef.current = { x: e.clientX, y: e.clientY };

            cursorRef.current.x = e.clientX;
            cursorRef.current.y = e.clientY;
            cursorRef.current.normalizedX = e.clientX / window.innerWidth;
            cursorRef.current.normalizedY = e.clientY / window.innerHeight;
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Animation loop
    useEffect(() => {
        const animate = () => {
            primaryRef.current.x = lerp(primaryRef.current.x, targetRef.current.x, 0.12);
            primaryRef.current.y = lerp(primaryRef.current.y, targetRef.current.y, 0.12);

            trailRef.current.x = lerp(trailRef.current.x, targetRef.current.x, 0.04);
            trailRef.current.y = lerp(trailRef.current.y, targetRef.current.y, 0.04);

            if (primaryGlowRef.current) {
                primaryGlowRef.current.style.transform =
                    `translate3d(${primaryRef.current.x - 200}px, ${primaryRef.current.y - 200}px, 0)`;
            }

            if (trailGlowRef.current) {
                trailGlowRef.current.style.transform =
                    `translate3d(${trailRef.current.x - 300}px, ${trailRef.current.y - 300}px, 0)`;
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    return (
        <CursorContext.Provider value={cursorRef}>
            {children}

            {/* Primary Glow */}
            <div
                ref={primaryGlowRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--cursor-glow) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 9998,
                    willChange: 'transform',
                    mixBlendMode: 'screen',
                }}
            />

            {/* Trail Glow */}
            <div
                ref={trailGlowRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 600,
                    height: 600,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--cursor-glow-trail) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 9997,
                    willChange: 'transform',
                    mixBlendMode: 'screen',
                }}
            />
        </CursorContext.Provider>
    );
}