import React, { useRef, useState, useCallback } from 'react';

export default function TiltCard({ children, className = '', maxTilt = 8, perspective = 800, glare = true, style = {}, ...props }) {
    const ref = useRef(null);
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

    const handleMouseMove = useCallback((e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        const normalizedX = deltaX / (rect.width / 2);
        const normalizedY = deltaY / (rect.height / 2);

        const rotateY = normalizedX * maxTilt;
        const rotateX = -normalizedY * maxTilt;

        setTilt({ rotateX, rotateY });

        const glareX = ((e.clientX - rect.left) / rect.width) * 100;
        const glareY = ((e.clientY - rect.top) / rect.height) * 100;
        setGlarePos({ x: glareX, y: glareY });
    }, [maxTilt]);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        setTilt({ rotateX: 0, rotateY: 0 });
        setGlarePos({ x: 50, y: 50 });
    }, []);

    return (
        <div
            ref={ref}
            className={`relative ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: `${perspective}px`,
                ...style,
            }}
            {...props}
        >
            <div
                style={{
                    transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                    transition: isHovered
                        ? 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                        : 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
                    willChange: 'transform',
                    position: 'relative',
                }}
            >
                {children}

                {/* Glare overlay — pointer-events: none ensures clicks pass through */}
                {glare && isHovered && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: 'inherit',
                            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
                            pointerEvents: 'none',
                            zIndex: 2,
                        }}
                        aria-hidden="true"
                    />
                )}
            </div>
        </div>
    );
}
