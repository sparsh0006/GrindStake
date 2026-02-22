import { Flame } from "lucide-react";

interface StreakDisplayProps {
  streak: number;
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`relative ${streak > 0 ? "" : ""}`}>
        <Flame
          size={20}
          className={streak > 0 ? "text-orange-400" : "text-zinc-600"}
        />
        {streak > 0 && (
          <div className="absolute -inset-1 bg-orange-400/20 rounded-full blur-md -z-10" />
        )}
      </div>
      <span className={`font-bold text-lg ${streak > 0 ? "text-white" : "text-zinc-600"}`}>
        {streak}
      </span>
      <span className="text-zinc-400 text-sm">day streak</span>
    </div>
  );
}
