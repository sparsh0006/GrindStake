"use client";

import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    shimmerColor?: string;
    shimmerSize?: string;
    children: React.ReactNode;
}

export function ShimmerButton({
    children,
    className,
    shimmerColor = "rgba(255,255,255,0.15)",
    shimmerSize = "200%",
    ...props
}: ShimmerButtonProps) {
    return (
        <button
            className={cn(
                "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full",
                "bg-gradient-to-r from-[#00FF87] to-[#00CC6A] px-8 py-4 text-lg font-bold text-black",
                "transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,255,135,0.25)]",
                "active:scale-[0.98]",
                className
            )}
            {...props}
        >
            {/* Shimmer sweep */}
            <div
                className="absolute inset-0 -translate-x-full animate-shimmer"
                style={{
                    background: `linear-gradient(90deg, transparent 0%, ${shimmerColor} 50%, transparent 100%)`,
                    backgroundSize: shimmerSize,
                }}
            />
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </button>
    );
}
