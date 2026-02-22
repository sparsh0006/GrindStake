"use client";

import { ReactNode } from "react";
import { FadeIn, StaggerContainer, StaggerItem, GlassCard } from "@/components/ui/motion";
import { NumberTicker } from "@/components/ui/number-ticker";

/* ── Page wrapper with fade-in ────────────────────────── */
export function PageFadeIn({ children }: { children: ReactNode }) {
    return <FadeIn>{children}</FadeIn>;
}

/* ── Stat card with animated number ──────────────────── */
export function AnimatedStatCard({
    label,
    value,
    suffix,
    icon,
}: {
    label: string;
    value: number;
    suffix?: string;
    icon?: ReactNode;
}) {
    return (
        <GlassCard className="p-4 text-center">
            {icon && <div className="mb-2 flex justify-center">{icon}</div>}
            <div className="text-2xl font-bold text-white">
                <NumberTicker value={value} suffix={suffix} />
            </div>
            <div className="text-zinc-400 text-xs mt-1">{label}</div>
        </GlassCard>
    );
}

/* ── Stagger grid wrapper ────────────────────────────── */
export function StaggerGrid({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <StaggerContainer className={className} staggerDelay={0.08}>
            {children}
        </StaggerContainer>
    );
}

export function StaggerGridItem({ children }: { children: ReactNode }) {
    return <StaggerItem>{children}</StaggerItem>;
}

/* ── Glass section wrapper ───────────────────────────── */
export function GlassSection({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <FadeIn>
            <GlassCard className={className}>
                {children}
            </GlassCard>
        </FadeIn>
    );
}
