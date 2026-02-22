import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/coach/ChatInterface";

export default async function CoachPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] md:h-screen">
      <div className="px-4 sm:px-6 py-4 border-b border-zinc-800">
        <h1 className="text-white font-bold text-lg">AI Coach</h1>
        <p className="text-zinc-400 text-sm">
          Personalized advice based on your workouts &amp; challenges
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
