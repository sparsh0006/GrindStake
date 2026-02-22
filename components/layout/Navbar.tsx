"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, Trophy, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/challenges", icon: Trophy, label: "Challenges" },
  { href: "/coach", icon: MessageSquare, label: "Coach" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-md border-b border-[#00FF87]/10 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
          <div className="w-8 h-8 rounded-xl bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,135,0.15)] group-hover:shadow-[0_0_20px_rgba(0,255,135,0.25)] transition-all">
            <Dumbbell className="text-[#00FF87]" size={16} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">Grind</span>
            <span className="text-[#00FF87] drop-shadow-[0_0_8px_rgba(0,255,135,0.4)]">Stake</span>
          </span>
        </Link>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/[0.08] flex z-50 pb-[env(safe-area-inset-bottom)]">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center py-3 gap-1 text-[10px] uppercase tracking-wider font-medium transition-all duration-200",
                isActive
                  ? "text-[#00FF87]"
                  : "text-white/40 hover:text-white"
              )}
            >
              <div className="relative">
                <Icon size={20} className={cn("transition-transform duration-200", isActive && "scale-110 drop-shadow-[0_0_5px_rgba(0,255,135,0.5)]")} />
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[#00FF87] shadow-[0_0_10px_rgba(0,255,135,0.6)]" />
                )}
              </div>
              <span className="mt-1">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
