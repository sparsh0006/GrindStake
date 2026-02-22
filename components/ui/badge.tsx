import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variants = {
  default: "bg-white/[0.06] text-zinc-300 border-white/[0.06]",
  success: "bg-[#00FF87]/10 text-[#00FF87] border-[#00FF87]/20 shadow-[0_0_8px_rgba(0,255,135,0.1)]",
  warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_8px_rgba(234,179,8,0.1)]",
  danger: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.1)]",
  info: "bg-[#0066FF]/10 text-[#3B82F6] border-[#0066FF]/20 shadow-[0_0_8px_rgba(0,102,255,0.1)]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-shadow",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
