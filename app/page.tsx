"use client";

import Link from "next/link";
import { Dumbbell, TrendingUp, Users, Zap, ArrowRight, ChevronRight } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { MagicCard } from "@/components/ui/magic-card";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden">
      {/* Nav */}
      <FadeIn>
        <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 font-bold text-xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00FF87] to-[#00CC6A] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,135,0.3)]">
              <Dumbbell className="text-black" size={18} />
            </div>
            <span className="tracking-tight">GrindStake</span>
          </div>
          <Link
            href="/login"
            className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.12] text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-200 text-sm"
          >
            Get Started
          </Link>
        </nav>
      </FadeIn>

      {/* Hero with Spotlight */}
      <Spotlight className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        <section className="text-center">
          <SlideUp>
            <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-1.5 text-sm text-zinc-400 mb-8">
              <div className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse shadow-[0_0_6px_rgba(0,255,135,0.8)]" />
              Built on Arbitrum  · Powered by AI
            </div>
          </SlideUp>

          <SlideUp delay={0.1}>
            <h1 className="text-5xl sm:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              <TextGenerateEffect
                words="Put your money where your workout is."
                highlightWords={["workout"]}
              />
            </h1>
          </SlideUp>

          <SlideUp delay={0.3}>
            <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Set fitness goals. Let friends bet Arbitrum Sepolia on whether you&apos;ll crush them.
              Get personalized AI coaching to make sure you win — and they lose.
            </p>
          </SlideUp>

          <SlideUp delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <ShimmerButton>
                  Connect Wallet & Start
                  <ArrowRight size={18} />
                </ShimmerButton>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 border border-white/[0.08] hover:border-white/[0.15] px-8 py-4 rounded-full text-lg transition-all duration-200 hover:bg-white/[0.04]"
              >
                View Demo
                <ChevronRight size={18} />
              </Link>
            </div>
          </SlideUp>
        </section>
      </Spotlight>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold mb-4">Everything you need to stay accountable</h2>
          <p className="text-center text-zinc-400 mb-12 max-w-lg mx-auto">Crypto stakes, AI coaching, and social accountability — all in one platform.</p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.1}>
          {[
            { icon: <TrendingUp className="text-[#00FF87]" size={22} />, title: "Track Progress", desc: "Log workouts manually or sync from Strava. Watch your goal progress in real time.", color: "rgba(0,255,135,0.12)" },
            { icon: <Users className="text-[#0066FF]" size={22} />, title: "Crypto Bets", desc: "Friends stake Arbitrum Sepolia — for or against you. Smart contract holds funds. Winners claim automatically.", color: "rgba(0,102,255,0.12)" },
            { icon: <Zap className="text-yellow-400" size={22} />, title: "AI Coach", desc: "Claude analyzes your workout history and gives personalized training advice to hit your goals.", color: "rgba(234,179,8,0.12)" },
            { icon: <Dumbbell className="text-purple-400" size={22} />, title: "Any Goal", desc: "Distance, weight loss, workout count, calories — set any challenge with a deadline and stake.", color: "rgba(168,85,247,0.12)" },
          ].map((f) => (
            <StaggerItem key={f.title}>
              <MagicCard className="p-6 h-full" gradientColor={f.color}>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white text-base mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </MagicCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <FadeIn>
          <h2 className="text-3xl font-bold text-center mb-4">How it works</h2>
          <p className="text-center text-zinc-400 mb-12">Four simple steps to crypto-powered fitness accountability</p>
        </FadeIn>

        <StaggerContainer className="space-y-6" staggerDelay={0.12}>
          {[
            { n: "1", title: "Create a challenge", desc: 'Set your goal — "Run 100km in 30 days" — and a deadline. It\'s registered on-chain.' },
            { n: "2", title: "Friends bet Arbitrum Sepolia", desc: "Share your challenge link. Friends stake Arbitrum Sepolia for or against your success. All funds go into a smart contract escrow." },
            { n: "3", title: "Train with AI coaching", desc: "Your AI coach analyzes your workouts and gives personalized advice every day to help you hit your target." },
            { n: "4", title: "Claim your winnings", desc: "After the deadline, report your outcome. Winners automatically claim their stakes plus the loser pool." },
          ].map((step) => (
            <StaggerItem key={step.n}>
              <div className="flex gap-5 items-start group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00FF87] to-[#00CC6A] text-black font-bold flex items-center justify-center flex-shrink-0 text-lg shadow-[0_0_20px_rgba(0,255,135,0.15)] group-hover:shadow-[0_0_30px_rgba(0,255,135,0.3)] transition-shadow">
                  {step.n}
                </div>
                <div className="pt-0.5">
                  <h3 className="font-semibold text-lg text-white">{step.title}</h3>
                  <p className="text-zinc-400 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <FadeIn>
          <div className="rounded-2xl border border-white/[0.06] bg-[#111111]/80 backdrop-blur-xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FF87]/5 to-[#0066FF]/5 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Ready to put your money where your workout is?</h2>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">Join the next generation of fitness accountability. Stake crypto, crush goals, earn rewards.</p>
              <Link href="/login">
                <ShimmerButton>
                  Start Your First Challenge
                  <ArrowRight size={18} />
                </ShimmerButton>
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-8 text-center text-zinc-500 text-sm">
        <p>GrindStake — Built on Arbitrum Sepolia · Powered by Claude AI · Strava compatible</p>
      </footer>
    </div>
  );
}
