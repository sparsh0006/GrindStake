import { Progress } from "@/components/ui/progress";
import { progressPercent, daysLeft } from "@/lib/utils";

interface GoalProgressBarProps {
  current: number;
  target: number;
  unit: string;
  deadline: Date;
}

export function GoalProgressBar({ current, target, unit, deadline }: GoalProgressBarProps) {
  const pct = progressPercent(current, target);
  const days = daysLeft(deadline);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-300 font-medium">
          {current.toFixed(1)} / {target} {unit}
        </span>
        <span className={`font-semibold ${pct >= 100 ? "text-[#00FF87]" : "text-zinc-400"}`}>
          {pct}%
        </span>
      </div>
      <Progress
        value={pct}
        glowColor={pct >= 100 ? "rgba(0,255,135,0.6)" : days <= 3 && pct < 80 ? "rgba(239,68,68,0.4)" : "rgba(0,255,135,0.4)"}
      />
      <p className="text-xs text-zinc-500">
        {pct >= 100 ? "🎯 Goal reached!" : `${days} day${days !== 1 ? "s" : ""} left`}
      </p>
    </div>
  );
}
