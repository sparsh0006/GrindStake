"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
    gradientColor?: string;
    gradientSize?: number;
}

export function MagicCard({
    children,
    className,
    gradientColor = "rgba(0,255,135,0.15)",
    gradientSize = 250,
    ...props
}: MagicCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        },
        []
    );

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111111] transition-shadow duration-500",
                "hover:shadow-[0_0_40px_rgba(0,255,135,0.08)]",
                className
            )}
            {...props}
        >
            {/* Radial glow overlay */}
            <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                style={{
                    opacity,
                    background: `radial-gradient(${gradientSize}px circle at ${position.x}px ${position.y}px, ${gradientColor}, transparent 60%)`,
                }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
}
