"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// import { WorkoutSource } from "@prisma/client";

type CheckInSource = "MANUAL" | "STRAVA" | "APPLE_HEALTH";

interface CheckIn {
    id: string;
    date: string;
    note: string | null;
    source: CheckInSource;
}

interface CheckInCalendarProps {
    challengeId: string;
    startDate: Date;
    endDate: Date;
    isOwner: boolean;
    checkInSource: CheckInSource;
}

function getDaysInRange(start: Date, end: Date): Date[] {
    const days: Date[] = [];
    const cur = new Date(start);
    cur.setUTCHours(0, 0, 0, 0);
    const endNorm = new Date(end);
    endNorm.setUTCHours(0, 0, 0, 0);
    while (cur <= endNorm) {
        days.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
    }
    return days;
}

function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getUTCFullYear() === b.getUTCFullYear() &&
        a.getUTCMonth() === b.getUTCMonth() &&
        a.getUTCDate() === b.getUTCDate()
    );
}

function toDateKey(d: Date): string {
    return d.toISOString().split("T")[0];
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CheckInCalendar({
    challengeId,
    startDate,
    endDate,
    isOwner,
    checkInSource,
}: CheckInCalendarProps) {
    const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);

    const fetchCheckIns = useCallback(async () => {
        try {
            const res = await fetch(`/api/challenges/${challengeId}/checkin`);
            if (res.ok) setCheckIns(await res.json());
        } finally {
            setLoading(false);
        }
    }, [challengeId]);

    useEffect(() => {
        fetchCheckIns();
    }, [fetchCheckIns]);

    const checkedDates = new Set(
        checkIns.map((c) => toDateKey(new Date(c.date)))
    );

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayKey = toDateKey(today);
    const isCheckedInToday = checkedDates.has(todayKey);
    const isTodayInRange = today >= new Date(new Date(startDate).setUTCHours(0, 0, 0, 0)) &&
        today <= new Date(new Date(endDate).setUTCHours(23, 59, 59, 999));

    async function handleCheckIn() {
        setCheckingIn(true);
        try {
            const res = await fetch(`/api/challenges/${challengeId}/checkin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            if (res.ok) {
                await fetchCheckIns();
                window.location.reload();
            }
        } finally {
            setCheckingIn(false);
        }
    }

    const allDays = getDaysInRange(startDate, endDate);
    const totalDays = allDays.length;
    const checkedCount = checkIns.length;

    const months = new Map<string, Date[]>();
    for (const d of allDays) {
        const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
        if (!months.has(key)) months.set(key, []);
        months.get(key)!.push(d);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8 text-zinc-500">
                <Loader2 className="animate-spin mr-2" size={16} />
                Loading calendar...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Stats bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-white">{checkedCount}</span>
                    <span className="text-zinc-400 text-sm">/ {totalDays} days checked in</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-[#00FF87]/60 shadow-[0_0_4px_rgba(0,255,135,0.4)] inline-block" /> Checked in
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-orange-500/60 shadow-[0_0_4px_rgba(251,146,60,0.4)] inline-block" /> Strava
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-red-500/40 border border-red-500/30 inline-block" /> Missed
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[#00FF87] to-[#00CC6A] rounded-full transition-all duration-700 relative"
                    style={{ width: `${totalDays > 0 ? (checkedCount / totalDays) * 100 : 0}%` }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-3 rounded-full animate-pulse-glow" style={{ boxShadow: "0 0 8px rgba(0,255,135,0.5)" }} />
                </div>
            </div>

            {/* Calendar grids by month */}
            {Array.from(months.entries()).map(([key, days]) => {
                const firstDay = days[0];
                const monthName = MONTH_NAMES[firstDay.getUTCMonth()];
                const year = firstDay.getUTCFullYear();
                const firstDayOfMonth = new Date(Date.UTC(year, firstDay.getUTCMonth(), 1));
                const startOffset = firstDayOfMonth.getUTCDay();
                const daysInMonth = new Date(Date.UTC(year, firstDay.getUTCMonth() + 1, 0)).getUTCDate();

                return (
                    <div key={key}>
                        <h3 className="text-zinc-300 text-sm font-medium mb-2">
                            {monthName} {year}
                        </h3>
                        <div className="grid grid-cols-7 gap-1">
                            {DAY_LABELS.map((d) => (
                                <div key={d} className="text-center text-[10px] text-zinc-600 pb-1">
                                    {d}
                                </div>
                            ))}
                            {Array.from({ length: startOffset }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = new Date(Date.UTC(year, firstDay.getUTCMonth(), i + 1));
                                const dayKey = toDateKey(day);
                                const isInRange = allDays.some((d) => isSameDay(d, day));
                                const isToday = isSameDay(day, today);
                                const checkIn = checkIns.find(
                                    (c) => toDateKey(new Date(c.date)) === dayKey
                                );
                                const isChecked = !!checkIn;
                                const isStrava = checkIn?.source === "STRAVA";
                                const isPast = day < today;

                                // RED for missed days
                                const isMissed = isInRange && !isChecked && isPast;

                                return (
                                    <div
                                        key={dayKey}
                                        className={`
                                            relative flex items-center justify-center h-9 rounded-lg text-xs font-medium transition-all duration-200
                                            ${!isInRange ? "text-zinc-700" : ""}
                                            ${isInRange && isChecked && isStrava ? "bg-orange-500/15 text-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.15)]" : ""}
                                            ${isInRange && isChecked && !isStrava ? "bg-[#00FF87]/15 text-[#00FF87] shadow-[0_0_6px_rgba(0,255,135,0.15)]" : ""}
                                            ${isMissed ? "bg-red-500/10 text-red-500 border border-red-500/20 shadow-[inset_0_0_10px_rgba(239,68,68,0.05)]" : ""}
                                            ${isInRange && !isChecked && !isPast ? "bg-white/[0.02] text-zinc-400" : ""}
                                            ${isToday ? "ring-1 ring-[#00FF87]/30 shadow-[0_0_8px_rgba(0,255,135,0.1)]" : ""}
                                        `}
                                    >
                                        {i + 1}
                                        {isInRange && isChecked && (
                                            <CheckCircle
                                                size={10}
                                                className={`absolute top-0.5 right-0.5 ${isStrava ? "text-orange-400" : "text-[#00FF87]"}`}
                                            />
                                        )}
                                        {isMissed && (
                                            <Circle
                                                size={8}
                                                className="absolute top-1 right-1 text-red-500/40 fill-red-500/10"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Check-in button */}
            {isOwner && isTodayInRange && (
                <div className="mt-4">
                    {checkInSource === "STRAVA" ? (
                        <div className="flex items-center justify-center gap-2 py-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 text-sm">
                            <span className="font-bold">S</span>
                            Auto-tracking active via Strava
                        </div>
                    ) : (
                        <Button
                            onClick={handleCheckIn}
                            disabled={isCheckedInToday}
                            loading={checkingIn}
                            className={`w-full ${isCheckedInToday ? "bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20 shadow-[0_0_15px_rgba(0,255,135,0.1)] hover:shadow-[0_0_15px_rgba(0,255,135,0.1)]" : ""}`}
                        >
                            {isCheckedInToday ? (
                                <>
                                    <CheckCircle size={16} />
                                    Checked in today ✓
                                </>
                            ) : (
                                "Check In for Today"
                            )}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
