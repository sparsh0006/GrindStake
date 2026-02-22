import { ChallengeForm } from "@/components/challenges/ChallengeForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewChallengePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6">
      <Link
        href="/challenges"
        className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to challenges
      </Link>

      <h1 className="text-white text-2xl font-bold mb-2">Create a Challenge</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Set a fitness goal, share it with friends, and let them bet on whether you&apos;ll succeed.
        The challenge is registered on-chain so bets are trustless.
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <ChallengeForm />
      </div>
    </div>
  );
}
