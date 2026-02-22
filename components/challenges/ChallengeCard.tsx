"use client";

import Link from "next/link";
import { GoalProgressBar } from "@/components/fitness/GoalProgressBar";
import { Badge } from "@/components/ui/badge";
import { MagicCard } from "@/components/ui/magic-card";
import { GOAL_TYPE_LABELS } from "@/types";
import type { ChallengeStatus, GoalType } from "@prisma/client";
import { Users, Clock, CalendarDays } from "lucide-react";

interface ChallengeCardProps {
  id: string;
  title: string;
  goalType: GoalType;
  goalTarget: number;
  goalUnit: string;
  currentProgress: number;
  deadline: Date;
  status: ChallengeStatus;
  betCount: number;
  creatorName?: string | null;
  isOwn?: boolean;
  challengeMode?: string;
}

const statusVariant: Record<ChallengeStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  INITIALIZED: "default",
  ACTIVE: "success",
  PENDING_RESOLUTION: "warning",
  COMPLETED: "info",
  FAILED: "danger",
  RESOLVED: "success",
  DISPUTED: "warning",
  CANCELLED: "default",
};

export function ChallengeCard({
  id,
  title,
  goalType,
  goalTarget,
  goalUnit,
  currentProgress,
  deadline,
  status,
  betCount,
  creatorName,
  isOwn,
  challengeMode,
}: ChallengeCardProps) {
  const isMultiDay = challengeMode === "MULTI_DAY";
  const daysRemaining = Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));

  return (
    <Link href={`/challenges/${id}`}>
      <MagicCard className="p-5 cursor-pointer group">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white text-base leading-snug truncate group-hover:text-[#00FF87] transition-colors">
              {title}
            </h3>
            <p className="text-zinc-500 text-xs mt-1">
              {GOAL_TYPE_LABELS[goalType]}
              {creatorName && !isOwn && ` · by ${creatorName}`}
              {isOwn && " · your challenge"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge variant={statusVariant[status]}>
              {status.replace("_", " ")}
            </Badge>
            {isMultiDay && (
              <Badge variant="info">
                <CalendarDays size={10} className="mr-0.5" />
                Multi-Day
              </Badge>
            )}
          </div>
        </div>

        {isMultiDay ? (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all"
                style={{ width: `${goalTarget > 0 ? Math.min((currentProgress / goalTarget) * 100, 100) : 0}%` }}
              />
            </div>
            <span className="text-xs text-purple-400 font-medium whitespace-nowrap">
              {Math.round(currentProgress)}/{Math.round(goalTarget)} days
            </span>
          </div>
        ) : (
          <GoalProgressBar
            current={currentProgress}
            target={goalTarget}
            unit={goalUnit}
            deadline={new Date(deadline)}
          />
        )}

        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
          {isOwn && betCount > 0 && (
            <span className="flex items-center gap-1">
              <Users size={12} className="text-[#00FF87]/60" />
              <span className="text-zinc-400">{betCount} bet{betCount !== 1 ? "s" : ""}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {daysRemaining > 0 ? `${daysRemaining}d left` : "Ended"}
          </span>
        </div>
      </MagicCard>
    </Link>
  );
}
