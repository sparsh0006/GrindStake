import type {
  Challenge,
  Bet,
  Workout,
  User,
  ChallengeStatus,
  GoalType,
  BetSide,
  BetStatus,
  WorkoutType,
} from "@prisma/client";

export type { ChallengeStatus, GoalType, BetSide, BetStatus, WorkoutType };

export type ChallengeWithMeta = Challenge & {
  creator: Pick<User, "id" | "name" | "walletAddress">;
  _count: { bets: number; workouts: number };
  bets?: Array<Pick<Bet, "side" | "amountEth" | "status">>;
};

export type BetWithChallenge = Bet & {
  challenge: Pick<
    Challenge,
    "id" | "title" | "status" | "deadline" | "goalTarget" | "goalUnit" | "currentProgress"
  >;
};

export type WorkoutWithChallenge = Workout & {
  challenge?: Pick<Challenge, "id" | "title"> | null;
};

export type BetPool = {
  totalFor: bigint;
  totalAgainst: bigint;
  yourBet?: { side: BetSide; amountWei: string } | null;
};

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  DISTANCE_KM: "Distance (km)",
  WEIGHT_LOSS_KG: "Weight loss (kg)",
  WORKOUT_COUNT: "Workout count",
  CALORIES_BURNED: "Calories burned",
  CUSTOM: "Custom goal",
};

export const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  RUN: "Run",
  RIDE: "Ride",
  SWIM: "Swim",
  WALK: "Walk",
  HIKE: "Hike",
  WEIGHT_TRAINING: "Weight Training",
  YOGA: "Yoga",
  CROSSFIT: "CrossFit",
  SPORT: "Sport",
  OTHER: "Other",
};
