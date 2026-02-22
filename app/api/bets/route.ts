import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { serializeBigInt } from "@/lib/utils";

const PlaceBetSchema = z.object({
  challengeId: z.string(),
  side: z.enum(["FOR", "AGAINST"]),
  amountEth: z.string(),
  amountWei: z.string(),
  txHash: z.string(),
  inviteToken: z.string(), // Required — must match challenge's invite token
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = PlaceBetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: parsed.data.challengeId },
  });
  if (!challenge || (challenge.status !== "ACTIVE" && challenge.status !== "INITIALIZED")) {
    return NextResponse.json({ error: "Challenge not bettable" }, { status: 400 });
  }
  if (challenge.creatorId === session.user.id) {
    return NextResponse.json({ error: "Cannot bet on your own challenge" }, { status: 400 });
  }
  // Validate invite token
  if (!challenge.inviteToken || challenge.inviteToken !== parsed.data.inviteToken) {
    return NextResponse.json({ error: "Invalid invite link — you need an invite from the challenge creator" }, { status: 403 });
  }

  const bet = await prisma.bet.create({
    data: {
      amountEth: parsed.data.amountEth,
      amountWei: parsed.data.amountWei,
      side: parsed.data.side,
      status: "CONFIRMED",
      txHash: parsed.data.txHash,
      userId: session.user.id,
      challengeId: parsed.data.challengeId,
    },
  });

  // Auto-activate challenge on first bet
  if (challenge.status === "INITIALIZED") {
    await prisma.challenge.update({
      where: { id: challenge.id },
      data: { status: "ACTIVE" },
    });
  }

  return NextResponse.json(serializeBigInt(bet), { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const challengeId = searchParams.get("challengeId");

  const bets = await prisma.bet.findMany({
    where: challengeId
      ? { challengeId }
      : { userId: session.user.id },
    include: {
      challenge: {
        select: {
          id: true,
          title: true,
          status: true,
          deadline: true,
          goalTarget: true,
          goalUnit: true,
          currentProgress: true,
        },
      },
      user: { select: { id: true, name: true, walletAddress: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(serializeBigInt(bets));
}
