"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, Trophy, MessageSquare, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/challenges", label: "Challenges", icon: Trophy },
  // { href: "/coach", label: "AI Coach", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-black/40 backdrop-blur-xl border-r border-white/[0.08] min-h-screen px-4 py-6 sticky top-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-3 mb-10 group hover:opacity-90 transition-opacity">
        <div className="w-10 h-10 rounded-xl bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,135,0.15)] group-hover:shadow-[0_0_25px_rgba(0,255,135,0.25)] transition-all duration-300">
          <Dumbbell className="text-[#00FF87]" size={20} />
        </div>
        <span className="text-xl font-bold tracking-tight">
          <span className="text-white">Grind</span>
          <span className="text-[#00FF87] drop-shadow-[0_0_8px_rgba(0,255,135,0.4)]">Stake</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 border border-transparent",
                isActive
                  ? "bg-[#00FF87]/10 text-[#00FF87] border-[#00FF87]/20 shadow-[0_0_15px_rgba(0,255,135,0.1)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.03] hover:border-white/[0.05]"
              )}
            >
              <div className="relative">
                <Icon size={18} className={cn("transition-colors", isActive && "drop-shadow-[0_0_5px_rgba(0,255,135,0.6)]")} />
                {isActive && (
                  <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#00FF87] shadow-[0_0_8px_rgba(0,255,135,0.8)]" />
                )}
              </div>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/[0.08] pt-4 mt-auto">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all duration-200 w-full group"
        >
          <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
