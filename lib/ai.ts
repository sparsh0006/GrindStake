import OpenAI from "openai";
import { prisma } from "./db";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const AI_SYSTEM_PROMPT = `You are FitCoach, an expert AI fitness and nutrition coach integrated into FitBet — an app where users set fitness challenges and friends bet crypto on their success.

You have access to the user's recent workout history and active fitness challenges. Provide personalized, actionable advice. Be encouraging but honest. Keep responses concise (2-4 paragraphs max) unless asked for detail. Reference their actual data when giving advice — avoid generic responses.

When users have active challenges with bets riding on them, factor in the stakes and motivation. Help them optimize their training to hit their goals.`;

export async function buildUserContext(userId: string): Promise<string> {
  const [user, recentWorkouts, activeChallenges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, stravaConnected: true },
    }),
    prisma.workout.findMany({
      where: { userId },
      orderBy: { startTime: "desc" },
      take: 20,
    }),
    prisma.challenge.findMany({
      where: { creatorId: userId, status: "ACTIVE" },
      include: { _count: { select: { bets: true } } },
    }),
  ]);

  const workoutSummary =
    recentWorkouts.length > 0
      ? recentWorkouts
        .map((w) => {
          const parts = [
            `- ${w.workoutType}`,
            `on ${new Date(w.startTime).toLocaleDateString()}`,
          ];
          if (w.distanceMeters)
            parts.push(`${(w.distanceMeters / 1000).toFixed(1)}km`);
          if (w.durationSeconds)
            parts.push(`${Math.round(w.durationSeconds / 60)}min`);
          if (w.caloriesBurned) parts.push(`${w.caloriesBurned}kcal`);
          if (w.avgHeartRate) parts.push(`avg HR: ${w.avgHeartRate}bpm`);
          return parts.join(" ");
        })
        .join("\n")
      : "No workouts logged yet.";

  const challengeSummary =
    activeChallenges.length > 0
      ? activeChallenges
        .map(
          (c) =>
            `- "${c.title}": ${c.currentProgress}/${c.goalTarget} ${c.goalUnit} (deadline: ${new Date(c.deadline).toLocaleDateString()}, ${c._count.bets} bets placed)`
        )
        .join("\n")
      : "No active challenges.";

  return `
User: ${user?.name ?? "Athlete"}
Strava connected: ${user?.stravaConnected ? "yes" : "no"}

Recent workouts (last 20):
${workoutSummary}

Active challenges:
${challengeSummary}
  `.trim();
}
