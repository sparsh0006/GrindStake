import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  glowColor?: string;
}

export function Progress({
  value,
  max = 100,
  className,
  glowColor = "rgba(0,255,135,0.4)",
}: ProgressProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("h-2 bg-white/[0.06] rounded-full overflow-hidden", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#00FF87] to-[#00CC6A] transition-all duration-700 ease-out relative"
        style={{ width: `${pct}%` }}
      >
        {/* Glow edge */}
        <div
          className="absolute right-0 top-0 bottom-0 w-4 rounded-full animate-pulse-glow"
          style={{ boxShadow: `0 0 12px ${glowColor}` }}
        />
      </div>
    </div>
  );
}
