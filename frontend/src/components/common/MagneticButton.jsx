import React, { useRef, useState, useCallback } from 'react';

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

export default function MagneticButton({ children, className = '', strength = 15, scale = 1.03, ...props }) {
    const ref = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const rafRef = useRef(null);
    const targetRef = useRef({ x: 0, y: 0 });
    const currentRef = useRef({ x: 0, y: 0 });

    const animate = useCallback(() => {
        currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.15);
        currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.15);
        setOffset({ x: currentRef.current.x, y: currentRef.current.y });

        if (Math.abs(currentRef.current.x - targetRef.current.x) > 0.01 ||
            Math.abs(currentRef.current.y - targetRef.current.y) > 0.01) {
            rafRef.current = requestAnimationFrame(animate);
        }
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        // Normalize and clamp
        const maxDist = Math.max(rect.width, rect.height);
        const normalizedX = (deltaX / maxDist) * strength;
        const normalizedY = (deltaY / maxDist) * strength;

        targetRef.current = {
            x: Math.max(-strength, Math.min(strength, normalizedX)),
            y: Math.max(-strength, Math.min(strength, normalizedY)),
        };

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animate);
    }, [strength, animate]);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        targetRef.current = { x: 0, y: 0 };
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animate);
    }, [animate]);

    return (
        <div
            ref={ref}
            className={`inline-block ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isHovered ? scale : 1})`,
                transition: isHovered
                    ? 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                    : 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'transform',
            }}
            {...props}
        >
            {children}
        </div>
    );
}
