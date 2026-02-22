import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { serializeBigInt } from "@/lib/utils";
import { randomUUID } from "crypto";

const CreateChallengeSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().optional(),
  challengeMode: z.enum(["SINGLE_DAY", "MULTI_DAY"]).default("SINGLE_DAY"),
  goalType: z.enum(["DISTANCE_KM", "WEIGHT_LOSS_KG", "WORKOUT_COUNT", "CALORIES_BURNED", "CUSTOM"]),
  goalTarget: z.number().positive(),
  goalUnit: z.string(),
  deadline: z.string().datetime(),
  contractChallengeId: z.string().optional(),
  txHash: z.string().optional(),
  checkInSource: z.enum(["MANUAL", "STRAVA"]).default("MANUAL"),
});

export async function GET(req: NextRequest) {
  // ... existing GET ...
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateChallengeSchema.safeParse(body);
  
  if (!parsed.success) {
    // ADD THIS LOG:
    console.log("Zod Validation Failed:", JSON.stringify(parsed.error.format(), null, 2));
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const challenge = await prisma.challenge.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      challengeMode: parsed.data.challengeMode,
      goalType: parsed.data.goalType,
      goalTarget: parsed.data.goalTarget,
      goalUnit: parsed.data.goalUnit,
      deadline: new Date(parsed.data.deadline),
      contractChallengeId: parsed.data.contractChallengeId,
      txHash: parsed.data.txHash,
      inviteToken: randomUUID(),
      creatorId: session.user.id,
      checkInSource: parsed.data.checkInSource,
    },
  });

  return NextResponse.json(serializeBigInt(challenge), { status: 201 });
}
