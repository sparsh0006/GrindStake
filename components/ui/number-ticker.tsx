"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
    value: number;
    decimals?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
}

export function NumberTicker({
    value,
    decimals = 0,
    className,
    prefix = "",
    suffix = "",
}: NumberTickerProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 40,
        stiffness: 200,
    });
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [motionValue, isInView, value]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent =
                    prefix + Intl.NumberFormat("en-US", {
                        minimumFractionDigits: decimals,
                        maximumFractionDigits: decimals,
                    }).format(Number(latest.toFixed(decimals))) + suffix;
            }
        });
        return unsubscribe;
    }, [springValue, decimals, prefix, suffix]);

    return (
        <span
            ref={ref}
            className={cn("tabular-nums", className)}
        >
            {prefix}0{suffix}
        </span>
    );
}
