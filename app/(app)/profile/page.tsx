import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { StravaConnectButton } from "@/components/fitness/StravaConnectButton";
import { WorkoutCard } from "@/components/fitness/WorkoutCard";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { shortenAddress, calculateStreak } from "@/lib/utils";
import { Wallet, Activity, Trophy, Smartphone } from "lucide-react";
import {
  PageFadeIn,
  AnimatedStatCard,
  StaggerGrid,
  StaggerGridItem,
  GlassSection,
} from "@/components/ui/animated-wrappers";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [user, workouts, challenges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        walletAddress: true,
        stravaConnected: true,
        lastStravaSync: true,
        createdAt: true,
        _count: { select: { challenges: true, bets: true, workouts: true } },
      },
    }),
    prisma.workout.findMany({
      where: { userId: session.user.id },
      orderBy: { startTime: "desc" },
      take: 20,
    }),
    prisma.challenge.findMany({
      where: { creatorId: session.user.id },
      include: { _count: { select: { bets: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  if (!user) redirect("/login");

  const streak = calculateStreak(workouts.map((w) => new Date(w.startTime)));

  return (
    <PageFadeIn>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">Profile</h1>

        {/* User info */}
        <GlassSection className="p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00FF87]/30 to-[#00CC6A]/10 flex items-center justify-center text-[#00FF87] font-bold text-xl ring-2 ring-[#00FF87]/20 shadow-[0_0_20px_rgba(0,255,135,0.15)]">
              {(user.name ?? "A")[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">
                {user.name ?? "Athlete"}
              </h2>
              <p className="text-zinc-400 text-sm">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <AnimatedStatCard label="Challenges" value={user._count.challenges} />
            <AnimatedStatCard label="Bets placed" value={user._count.bets} />
            <AnimatedStatCard label="Workouts" value={user._count.workouts} />
          </div>
        </GlassSection>

        {/* Wallet */}
        <GlassSection className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={18} className="text-zinc-400" />
            <h2 className="text-white font-semibold">Wallet</h2>
          </div>
          {user.walletAddress ? (
            <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl px-4 py-3 font-mono text-sm text-zinc-300">
              {user.walletAddress}
            </div>
          ) : (
            <p className="text-zinc-400 text-sm">No wallet connected.</p>
          )}
        </GlassSection>

        {/* Strava */}
        <GlassSection className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-zinc-400" />
              <h2 className="text-white font-semibold">Strava</h2>
              {user.stravaConnected && (
                <div className="w-2 h-2 rounded-full bg-[#00FF87] shadow-[0_0_6px_rgba(0,255,135,0.8)] animate-pulse" />
              )}
            </div>
            {user.lastStravaSync && (
              <span className="text-xs text-zinc-500">
                Last synced: {new Date(user.lastStravaSync).toLocaleString()}
              </span>
            )}
          </div>
          <StravaConnectButton connected={user.stravaConnected} />
        </GlassSection>

        {/* Apple Health note */}
        <GlassSection className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone size={18} className="text-zinc-400" />
            <h2 className="text-white font-semibold">Apple Health</h2>
          </div>
          {/* <p className="text-zinc-400 text-sm leading-relaxed">
            Apple Health sync requires a native iOS app. To use your Apple Health data now,
            export workouts from the Health app (Browse → Activity → Workouts → Share) and
            log them manually using the &quot;Log workout&quot; button.
          </p> */}
        </GlassSection>

        {/* Recent challenges */}
        {challenges.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-yellow-400" />
              <h2 className="text-white font-semibold">Your challenges</h2>
            </div>
            <StaggerGrid className="grid gap-4 sm:grid-cols-2">
              {challenges.map((c) => (
                <StaggerGridItem key={c.id}>
                  <ChallengeCard
                    id={c.id}
                    title={c.title}
                    goalType={c.goalType}
                    goalTarget={c.goalTarget}
                    goalUnit={c.goalUnit}
                    currentProgress={c.currentProgress}
                    deadline={c.deadline}
                    status={c.status}
                    betCount={c._count.bets}
                    isOwn
                  />
                </StaggerGridItem>
              ))}
            </StaggerGrid>
          </section>
        )}

        {/* Recent workouts */}
        {workouts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-[#00FF87]" />
              <h2 className="text-white font-semibold">
                Recent workouts · {streak > 0 ? `🔥 ${streak} day streak` : "No streak"}
              </h2>
            </div>
            <GlassSection className="px-4">
              {workouts.slice(0, 10).map((w) => (
                <WorkoutCard
                  key={w.id}
                  workoutType={w.workoutType}
                  startTime={new Date(w.startTime)}
                  durationSeconds={w.durationSeconds}
                  distanceMeters={w.distanceMeters}
                  caloriesBurned={w.caloriesBurned}
                  avgHeartRate={w.avgHeartRate}
                  source={w.source}
                  name={w.name}
                />
              ))}
            </GlassSection>
          </section>
        )}
      </div>
    </PageFadeIn>
  );
}
