import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const RegisterSchema = z.object({
    contractChallengeId: z.string(),
    txHash: z.string(),
});

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const challenge = await prisma.challenge.findUnique({
        where: { id },
    });

    if (!challenge) {
        return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    if (challenge.creatorId !== session.user.id) {
        return NextResponse.json({ error: "Not your challenge" }, { status: 403 });
    }

    if (challenge.contractChallengeId) {
        return NextResponse.json(
            { error: "Challenge already registered on-chain" },
            { status: 400 }
        );
    }

    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", details: parsed.error.issues },
            { status: 400 }
        );
    }

    const updated = await prisma.challenge.update({
        where: { id },
        data: {
            contractChallengeId: parsed.data.contractChallengeId,
            txHash: parsed.data.txHash,
        },
    });

    return NextResponse.json(updated);
}
