import { WORKOUT_TYPE_LABELS } from "@/types";
import type { WorkoutType } from "@prisma/client";
import { Timer, MapPin, Flame, Heart, Activity } from "lucide-react";

interface WorkoutCardProps {
  workoutType: WorkoutType;
  startTime: Date;
  durationSeconds?: number | null;
  distanceMeters?: number | null;
  caloriesBurned?: number | null;
  avgHeartRate?: number | null;
  source: string;
  name?: string | null;
}

export function WorkoutCard({
  workoutType,
  startTime,
  durationSeconds,
  distanceMeters,
  caloriesBurned,
  avgHeartRate,
  source,
  name,
}: WorkoutCardProps) {
  const isStrava = source === "STRAVA";

  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-white/[0.04] last:border-0 group">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-shadow duration-300 ${isStrava
            ? "bg-orange-500/10 group-hover:shadow-[0_0_12px_rgba(251,146,60,0.15)]"
            : "bg-[#00FF87]/10 group-hover:shadow-[0_0_12px_rgba(0,255,135,0.15)]"
          }`}
      >
        <Activity size={18} className={isStrava ? "text-orange-400" : "text-[#00FF87]"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-white text-sm truncate">
            {name ?? WORKOUT_TYPE_LABELS[workoutType]}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isStrava && (
              <span className="text-[10px] font-bold text-[#FC4C02] bg-orange-500/10 border border-orange-500/20 rounded-full px-2 py-0.5">
                STRAVA
              </span>
            )}
            <span className="text-xs text-zinc-500">
              {new Date(startTime).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400 flex-wrap">
          {durationSeconds && (
            <span className="flex items-center gap-1">
              <Timer size={12} className="text-zinc-500" />
              {Math.floor(durationSeconds / 3600) > 0
                ? `${Math.floor(durationSeconds / 3600)}h ${Math.floor((durationSeconds % 3600) / 60)}m`
                : `${Math.round(durationSeconds / 60)}m`}
            </span>
          )}
          {distanceMeters && distanceMeters > 0 && (
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-zinc-500" />
              {(distanceMeters / 1000).toFixed(2)} km
            </span>
          )}
          {caloriesBurned && (
            <span className="flex items-center gap-1">
              <Flame size={12} className="text-orange-400/60" />
              {caloriesBurned} kcal
            </span>
          )}
          {avgHeartRate && (
            <span className="flex items-center gap-1">
              <Heart size={12} className="text-red-400/60" />
              {avgHeartRate} bpm
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
