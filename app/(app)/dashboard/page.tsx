import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { WorkoutCard } from "@/components/fitness/WorkoutCard";
import { StreakDisplay } from "@/components/fitness/StreakDisplay";
import { LogWorkoutButton } from "./LogWorkoutButton";
import { calculateStreak } from "@/lib/utils";
import { Plus, Trophy, Dumbbell, TrendingUp, Coins } from "lucide-react";
import {
  PageFadeIn,
  AnimatedStatCard,
  StaggerGrid,
  StaggerGridItem,
  GlassSection,
} from "@/components/ui/animated-wrappers";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [challenges, workouts, betActivity] = await Promise.all([
    prisma.challenge.findMany({
      where: { creatorId: session.user.id, status: "ACTIVE" },
      include: { _count: { select: { bets: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.workout.findMany({
      where: { userId: session.user.id },
      orderBy: { startTime: "desc" },
      take: 5,
    }),
    prisma.bet.findMany({
      where: { challenge: { creatorId: session.user.id } },
      include: {
        user: { select: { name: true, walletAddress: true } },
        challenge: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const streak = calculateStreak(workouts.map((w) => new Date(w.startTime)));
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  return (
    <PageFadeIn>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">
              Hey, {user?.name ?? "Athlete"} 👋
            </h1>
            <div className="mt-1">
              <StreakDisplay streak={streak} />
            </div>
          </div>
          <LogWorkoutButton />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <AnimatedStatCard
            label="Active Challenges"
            value={challenges.length}
            icon={<Trophy size={18} className="text-yellow-400" />}
          />
          <AnimatedStatCard
            label="Day Streak"
            value={streak}
            icon={<TrendingUp size={18} className="text-[#00FF87]" />}
          />
          <AnimatedStatCard
            label="Total Bets"
            value={betActivity.length}
            icon={<Coins size={18} className="text-[#0066FF]" />}
          />
        </div>

        {/* Active Challenges */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Trophy size={18} className="text-yellow-400" />
              Your active challenges
            </h2>
            <Link
              href="/challenges/new"
              className="flex items-center gap-1 text-sm text-[#00FF87] hover:text-[#00FF87]/80 transition-colors"
            >
              <Plus size={16} />
              New challenge
            </Link>
          </div>

          {challenges.length === 0 ? (
            <GlassSection className="p-8 text-center border-dashed">
              <Trophy size={32} className="text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 mb-4">No active challenges yet.</p>
              <Link
                href="/challenges/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00FF87] to-[#00CC6A] text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-[0_0_25px_rgba(0,255,135,0.2)]"
              >
                <Plus size={16} />
                Create your first challenge
              </Link>
            </GlassSection>
          ) : (
            <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          )}
        </section>

        {/* Recent Workouts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Dumbbell size={18} className="text-[#00FF87]" />
              Recent workouts
            </h2>
            <Link
              href="/profile"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              View all
            </Link>
          </div>

          {workouts.length === 0 ? (
            <GlassSection className="p-6 text-center border-dashed">
              <p className="text-zinc-400 text-sm">No workouts logged yet. Log your first one!</p>
            </GlassSection>
          ) : (
            <GlassSection className="px-4">
              {workouts.map((w) => (
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
          )}
        </section>

        {/* Bets on Your Challenges */}
        {betActivity.length > 0 && (
          <section>
            <h2 className="text-white font-semibold mb-4">
              Recent bets on your challenges
            </h2>
            <div className="space-y-2">
              {betActivity.map((bet) => (
                <div
                  key={bet.id}
                  className="rounded-xl border border-white/[0.06] bg-[#111111] px-4 py-3 flex items-center justify-between hover:border-white/[0.1] transition-colors"
                >
                  <div>
                    <span className="text-white text-sm font-medium">
                      {bet.user.name ?? bet.user.walletAddress?.slice(0, 10) + "..."}
                    </span>
                    <span
                      className={`ml-2 text-xs font-medium ${bet.side === "FOR" ? "text-[#00FF87]" : "text-red-400"
                        }`}
                    >
                      bet {bet.side}
                    </span>
                    <span className="text-zinc-500 text-xs ml-1">
                      on &quot;{bet.challenge.title}&quot;
                    </span>
                  </div>
                  <span className="text-white text-sm font-semibold">
                    {bet.amountEth} tBNB
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageFadeIn>
  );
}
