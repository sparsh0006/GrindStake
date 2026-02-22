import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { GoalProgressBar } from "@/components/fitness/GoalProgressBar";
import { Badge } from "@/components/ui/badge";
import { BetPoolDisplay } from "@/components/betting/BetPoolDisplay";
import { ChallengeActions } from "./ChallengeActions";
import { WorkoutCard } from "@/components/fitness/WorkoutCard";
import { CheckInCalendar } from "@/components/challenges/CheckInCalendar";
import { BettorsList } from "@/components/challenges/BettorsList";
import { GOAL_TYPE_LABELS } from "@/types";
import { shortenAddress } from "@/lib/utils";
import { ArrowLeft, Calendar, User, CalendarDays } from "lucide-react";
import Link from "next/link";
import type { ChallengeStatus } from "@prisma/client";
import { PageFadeIn, GlassSection } from "@/components/ui/animated-wrappers";

const statusVariant: Record<ChallengeStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  INITIALIZED: "default",
  ACTIVE: "success",
  PENDING_RESOLUTION: "warning",
  COMPLETED: "info",
  FAILED: "danger",
  RESOLVED: "success",
  DISPUTED: "warning",
  CANCELLED: "default",
};

export default async function ChallengeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const { invite } = await searchParams;

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, walletAddress: true } },
      bets: {
        include: { user: { select: { id: true, name: true, walletAddress: true } } },
        orderBy: { createdAt: "desc" },
      },
      workouts: { orderBy: { startTime: "desc" }, take: 10 },
      _count: { select: { bets: true } },
    },
  });

  if (!challenge) notFound();

  const isOwner = challenge.creatorId === session.user.id;
  const userBet = challenge.bets.find((b) => b.userId === session.user.id);
  const pastDeadline = new Date(challenge.deadline) < new Date();
  const hasValidInvite = invite === challenge.inviteToken;
  const isMultiDay = challenge.challengeMode === "MULTI_DAY";

  const totalFor = challenge.bets
    .filter((b) => b.side === "FOR")
    .reduce((sum, b) => sum + BigInt(b.amountWei), BigInt(0));
  const totalAgainst = challenge.bets
    .filter((b) => b.side === "AGAINST")
    .reduce((sum, b) => sum + BigInt(b.amountWei), BigInt(0));

  return (
    <PageFadeIn>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Back */}
        <Link
          href="/challenges"
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Challenges
        </Link>

        {/* Header */}
        <GlassSection className="p-6 relative overflow-hidden">
          {/* Subtle gradient top border */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00FF87]/30 to-transparent" />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-white text-xl font-bold tracking-tight">{challenge.title}</h1>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-400">
                <span className="flex items-center gap-1">
                  <User size={13} />
                  {challenge.creator.name ??
                    shortenAddress(challenge.creator.walletAddress ?? "")}
                  {isOwner && " (you)"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  Due {new Date(challenge.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant={statusVariant[challenge.status]}>
                {challenge.status.replace("_", " ")}
              </Badge>
              {isMultiDay && (
                <Badge variant="info">
                  <CalendarDays size={12} className="mr-1" />
                  Multi-Day
                </Badge>
              )}
            </div>
          </div>

          {challenge.description && (
            <p className="text-zinc-300 text-sm mb-4">{challenge.description}</p>
          )}

          <div className="text-xs text-zinc-500 mb-4">
            {isMultiDay ? "Daily check-in challenge" : GOAL_TYPE_LABELS[challenge.goalType]}
          </div>

          {isMultiDay ? (
            <CheckInCalendar
              challengeId={challenge.id}
              startDate={new Date(challenge.createdAt)}
              endDate={new Date(challenge.deadline)}
              isOwner={isOwner}
              checkInSource={challenge.checkInSource}
            />
          ) : (
            <GoalProgressBar
              current={challenge.currentProgress}
              target={challenge.goalTarget}
              unit={challenge.goalUnit}
              deadline={new Date(challenge.deadline)}
            />
          )}
        </GlassSection>

        {/* Bet Pool — ONLY visible to challenge creator */}
        {isOwner && (
          <GlassSection className="p-6">
            <h2 className="text-white font-semibold mb-4">Bet Pool (private)</h2>
            <BetPoolDisplay
              totalFor={totalFor.toString()}
              totalAgainst={totalAgainst.toString()}
              betCount={challenge._count.bets}
            />

            {userBet && (
              <div className="mt-4 bg-white/[0.03] rounded-xl px-4 py-3 text-sm border border-white/[0.04]">
                <span className="text-zinc-400">Your bet: </span>
                <span
                  className={
                    userBet.side === "FOR" ? "text-[#00FF87] font-medium" : "text-red-400 font-medium"
                  }
                >
                  {userBet.amountEth} tBNB {userBet.side}
                </span>
              </div>
            )}
          </GlassSection>
        )}

        {/* Non-owner: show their own bet if they placed one */}
        {!isOwner && userBet && (
          <GlassSection className="p-6">
            <h2 className="text-white font-semibold mb-3">Your Bet</h2>
            <div className="bg-white/[0.03] rounded-xl px-4 py-3 text-sm border border-white/[0.04]">
              <span
                className={
                  userBet.side === "FOR" ? "text-[#00FF87] font-medium" : "text-red-400 font-medium"
                }
              >
                {userBet.amountEth} tBNB {userBet.side}
              </span>
            </div>
          </GlassSection>
        )}

        {/* Actions */}
        <ChallengeActions
          challengeId={id}
          contractChallengeId={challenge.contractChallengeId}
          challengeTitle={challenge.title}
          isOwner={isOwner}
          status={challenge.status}
          pastDeadline={pastDeadline}
          hasExistingBet={!!userBet}
          deadline={challenge.deadline}
          inviteToken={isOwner ? challenge.inviteToken : (hasValidInvite ? invite : null)}
          userBetSide={userBet?.side}
        />

        {/* Recent Workouts */}
        {challenge.workouts.length > 0 && (
          <GlassSection className="p-6">
            <h2 className="text-white font-semibold mb-3">
              Workouts logged ({challenge.workouts.length})
            </h2>
            {challenge.workouts.map((w) => (
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

        {/* Private Bets List (Owner/Database) */}
        {isOwner && challenge.bets.length > 0 && (
          <GlassSection className="p-6">
            <h2 className="text-white font-semibold mb-3">All bets (private)</h2>
            <div className="space-y-2">
              {challenge.bets.map((bet) => (
                <div
                  key={bet.id}
                  className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0"
                >
                  <div className="text-sm">
                    <span className="text-white font-medium">
                      {bet.user.name ??
                        shortenAddress(bet.user.walletAddress ?? "0x0")}
                    </span>
                    <span
                      className={`ml-2 text-xs ${bet.side === "FOR" ? "text-[#00FF87]" : "text-red-400"
                        }`}
                    >
                      {bet.side}
                    </span>
                  </div>
                  <span className="text-white text-sm font-semibold">
                    {bet.amountEth} tBNB
                  </span>
                </div>
              ))}
            </div>
          </GlassSection>
        )}

        {/* On-Chain Participants List (Visible to all) */}
        <BettorsList
          challengeId={id}
          contractChallengeId={challenge.contractChallengeId}
        />
      </div>
    </PageFadeIn>
  );
}
