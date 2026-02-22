import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { serializeBigInt } from "@/lib/utils";

const ResolveSchema = z.object({
  succeeded: z.boolean(),
  note: z.string().optional(),
  txHash: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (challenge.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (challenge.status !== "ACTIVE") {
    return NextResponse.json({ error: "Challenge already resolved" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = ResolveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.challenge.update({
    where: { id },
    data: {
      status: parsed.data.succeeded ? "COMPLETED" : "FAILED",
      resolvedAt: new Date(),
      resolvedSuccess: parsed.data.succeeded,
      resolutionNote: parsed.data.note,
      ...(parsed.data.txHash ? { txHash: parsed.data.txHash } : {}),
    },
  });

  return NextResponse.json(serializeBigInt(updated));
}
