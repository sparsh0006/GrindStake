"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
    gradientFirst?: string;
    gradientSecond?: string;
    size?: number;
}

export function Spotlight({
    children,
    className,
    gradientFirst = "rgba(0,255,135,0.12)",
    gradientSecond = "rgba(0,102,255,0.08)",
    size = 600,
    ...props
}: SpotlightProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x: 50, y: 50 });

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            setPos({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
            });
        },
        []
    );

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            className={cn("relative overflow-hidden", className)}
            {...props}
        >
            {/* Spotlight layer */}
            <div
                className="pointer-events-none absolute inset-0 transition-all duration-300 ease-out"
                style={{
                    background: `radial-gradient(${size}px circle at ${pos.x}% ${pos.y}%, ${gradientFirst}, ${gradientSecond} 40%, transparent 70%)`,
                }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
}
