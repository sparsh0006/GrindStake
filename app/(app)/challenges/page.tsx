import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { Plus, Trophy } from "lucide-react";
import {
  PageFadeIn,
  StaggerGrid,
  StaggerGridItem,
  GlassSection,
} from "@/components/ui/animated-wrappers";

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { filter = "all" } = await searchParams;

  const where =
    filter === "mine"
      ? { creatorId: session.user.id }
      : filter === "betting"
        ? { bets: { some: { userId: session.user.id } } }
        : {};

  const challenges = await prisma.challenge.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, walletAddress: true } },
      _count: { select: { bets: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // const tabs = [
  //   { label: "All", value: "all" },
  //   { label: "My Challenges", value: "mine" },
  //   { label: "I'm Betting", value: "betting" },
  // ];

  return (
    <PageFadeIn>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-2xl font-bold flex items-center gap-2 tracking-tight">
            <Trophy size={24} className="text-yellow-400" />
            Challenges
          </h1>
          <Link
            href="/challenges/new"
            className="flex items-center gap-2 bg-gradient-to-r from-[#00FF87] to-[#00CC6A] text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-[0_0_25px_rgba(0,255,135,0.2)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            New challenge
          </Link>
        </div>

        {/* Filter tabs */}
        {/* <div className="flex gap-1 mb-6 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit backdrop-blur-sm">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/challenges?filter=${tab.value}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === tab.value
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                }`}
            >
              {tab.label}
            </Link>
          ))}
        </div> */}

        {/* Challenges grid */}
        {challenges.length === 0 ? (
          <GlassSection className="p-12 text-center border-dashed">
            <Trophy size={36} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 mb-4">
              {filter === "mine"
                ? "You haven't created any challenges yet."
                : filter === "betting"
                  ? "You're not betting on any challenges yet."
                  : "No challenges found."}
            </p>
            <Link
              href="/challenges/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00FF87] to-[#00CC6A] text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-[0_0_25px_rgba(0,255,135,0.2)]"
            >
              <Plus size={16} />
              Create a challenge
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
                  creatorName={c.creator.name}
                  isOwn={c.creatorId === session.user.id}
                  challengeMode={c.challengeMode}
                />
              </StaggerGridItem>
            ))}
          </StaggerGrid>
        )}
      </div>
    </PageFadeIn>
  );
}
