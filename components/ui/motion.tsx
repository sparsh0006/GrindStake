"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Fade In ──────────────────────────────────────────── */
export function FadeIn({
    children,
    className,
    delay = 0,
    duration = 0.5,
    ...props
}: HTMLMotionProps<"div"> & { delay?: number; duration?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/* ── Slide Up ──────────────────────────────────────────── */
export function SlideUp({
    children,
    className,
    delay = 0,
    ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/* ── Stagger Container + Item ────────────────────────── */
export function StaggerContainer({
    children,
    className,
    staggerDelay = 0.08,
    ...props
}: HTMLMotionProps<"div"> & { staggerDelay?: number }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: staggerDelay } },
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className,
    ...props
}: HTMLMotionProps<"div">) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20, scale: 0.97 },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.4, ease: "easeOut" },
                },
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/* ── Glass Card ──────────────────────────────────────── */
export function GlassCard({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-white/[0.06] bg-[#111111]/80 backdrop-blur-xl",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
