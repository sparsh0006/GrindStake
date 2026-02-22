import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary:
    "bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87] shadow-[0_0_15px_rgba(0,255,135,0.15)] hover:bg-[#00FF87]/20 hover:shadow-[0_0_25px_rgba(0,255,135,0.25)] active:scale-[0.97]",
  secondary:
    "bg-white/[0.05] border border-white/[0.1] text-white hover:border-[#00FF87]/30 hover:bg-white/[0.08] active:scale-[0.98]",
  ghost:
    "text-zinc-400 hover:text-white hover:bg-white/[0.05]",
  danger:
    "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]",
  outline:
    "bg-transparent border border-[#00FF87]/30 text-[#00FF87] hover:bg-[#00FF87]/5",
};

const sizes = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 py-2 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = "primary", size = "md", loading = false, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 select-none",
          "disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={16} />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
