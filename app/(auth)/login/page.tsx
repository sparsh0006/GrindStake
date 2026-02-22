"use client";

import { useState } from "react";
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dumbbell, Wallet, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  async function handleSignIn() {
    if (!address) return;
    setSigningIn(true);
    setError(null);
    try {
      const message = `Sign in to GrindStake\n\nAddress: ${address}\nTimestamp: ${Date.now()}`;
      const signature = await signMessageAsync({ message });
      const result = await signIn("credentials", {
        address,
        message,
        signature,
        redirect: false,
      });
      if (result?.error) {
        setError("Sign-in failed. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message?.includes("User rejected") ? "Signature rejected." : "Something went wrong.");
    } finally {
      setSigningIn(false);
    }
  }

  const metaMask = connectors.find((c) => c.id === "metaMask") ?? connectors[0];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Dumbbell className="text-green-400" size={28} />
          <span className="text-white font-bold text-2xl">GrindStake</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-white text-xl font-semibold mb-1">Connect your wallet</h1>
          <p className="text-zinc-400 text-sm mb-6">
            Sign in with MetaMask to create challenges, place bets, and talk to your AI coach.
          </p>

          {!isConnected ? (
            <button
              onClick={() => connect({ connector: metaMask })}
              disabled={isConnecting}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Wallet size={18} />
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 flex items-center justify-between">
                <span className="font-mono">
                  {address?.slice(0, 8)}...{address?.slice(-6)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="text-zinc-500 hover:text-red-400 text-xs transition-colors"
                >
                  Disconnect
                </button>
              </div>
              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {signingIn ? "Signing..." : "Sign in"}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-zinc-600 text-sm mt-6">
          <Link href="/" className="hover:text-zinc-400 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
