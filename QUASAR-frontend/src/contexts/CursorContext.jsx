import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const CursorContext = createContext({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
});

export function useCursor() {
    return useContext(CursorContext);
}

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

export function CursorProvider({ children }) {
    const [cursor, setCursor] = useState({ x: 0, y: 0, normalizedX: 0.5, normalizedY: 0.5 });
    const targetRef = useRef({ x: 0, y: 0 });
    const primaryRef = useRef({ x: 0, y: 0 });
    const trailRef = useRef({ x: 0, y: 0 });
    const primaryGlowRef = useRef(null);
    const trailGlowRef = useRef(null);
    const rafRef = useRef(null);
    const isTouch = useRef(false);

    const handleMouseMove = useCallback((e) => {
        targetRef.current = { x: e.clientX, y: e.clientY };
        const nx = e.clientX / window.innerWidth;
        const ny = e.clientY / window.innerHeight;
        setCursor({ x: e.clientX, y: e.clientY, normalizedX: nx, normalizedY: ny });
    }, []);

    const handleTouchStart = useCallback(() => {
        isTouch.current = true;
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchstart', handleTouchStart);
        };
    }, [handleMouseMove, handleTouchStart]);

    useEffect(() => {
        const animate = () => {
            // Lerp primary glow — tight follow
            primaryRef.current.x = lerp(primaryRef.current.x, targetRef.current.x, 0.12);
            primaryRef.current.y = lerp(primaryRef.current.y, targetRef.current.y, 0.12);

            // Lerp trail glow — lazy follow
            trailRef.current.x = lerp(trailRef.current.x, targetRef.current.x, 0.04);
            trailRef.current.y = lerp(trailRef.current.y, targetRef.current.y, 0.04);

            if (primaryGlowRef.current) {
                primaryGlowRef.current.style.transform = `translate3d(${primaryRef.current.x - 200}px, ${primaryRef.current.y - 200}px, 0)`;
            }
            if (trailGlowRef.current) {
                trailGlowRef.current.style.transform = `translate3d(${trailRef.current.x - 300}px, ${trailRef.current.y - 300}px, 0)`;
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <CursorContext.Provider value={cursor}>
            {children}

            {/* Primary Glow — tight follow */}
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
                aria-hidden="true"
            />

            {/* Trailing Glow — lazy follow */}
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
                aria-hidden="true"
            />
        </CursorContext.Provider>
    );
}

export default CursorContext;
