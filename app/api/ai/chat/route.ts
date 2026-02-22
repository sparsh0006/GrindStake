import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { openai, buildUserContext, AI_SYSTEM_PROMPT } from "@/lib/ai";
import { z } from "zod";

const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const parsed = ChatSchema.safeParse(body);
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    return new Response(JSON.stringify({ error: "Invalid request", details: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { message, conversationId } = parsed.data;

  // Load or create conversation
  let conversation = conversationId
    ? await prisma.aiConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 20 },
      },
    })
    : null;

  if (!conversation) {
    conversation = await prisma.aiConversation.create({
      data: {
        userId: session.user.id,
        title: message.slice(0, 60),
      },
      include: { messages: true },
    });
  }

  // Verify ownership
  if (conversation.userId !== session.user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  let userContext: string;
  try {
    userContext = await buildUserContext(session.user.id);
  } catch (err) {
    console.error("Error building user context:", err);
    return new Response(JSON.stringify({ error: "Failed to load user data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Save user message
  await prisma.aiMessage.create({
    data: {
      conversationId: conversation.id,
      role: "USER",
      content: message,
    },
  });

  const history = conversation.messages.map((m) => ({
    role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));

  // Stream from OpenAI
  let fullResponse = "";
  const encoder = new TextEncoder();
  const convId = conversation.id;

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: `${AI_SYSTEM_PROMPT}\n\n${userContext}` },
            ...history,
            { role: "user", content: message },
          ],
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            fullResponse += content;
            controller.enqueue(encoder.encode(content));
          }
        }

        // Persist assistant response after stream completes
        await prisma.aiMessage.create({
          data: {
            conversationId: convId,
            role: "ASSISTANT",
            content: fullResponse,
          },
        });
      } catch (err) {
        console.error("OpenAI streaming error:", err);
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": convId,
      "Cache-Control": "no-cache",
    },
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const conversations = await prisma.aiConversation.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return Response.json(conversations);
}
