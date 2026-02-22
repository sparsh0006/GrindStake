"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import { FITNESS_BET_ADDRESS, FITNESS_BET_ABI } from "@/lib/contract";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Loader2, Wallet } from "lucide-react";

interface PlaceBetDialogProps {
  open: boolean;
  onClose: () => void;
  challengeId: string;
  contractChallengeId: string | null;
  challengeTitle: string;
  inviteToken: string;
  onSuccess?: () => void;
  isJoining?: boolean;
}

export function PlaceBetDialog({
  open,
  onClose,
  challengeId,
  contractChallengeId,
  challengeTitle,
  inviteToken,
  onSuccess,
  isJoining = false,
}: PlaceBetDialogProps) {
  const [amount, setAmount] = useState(isJoining ? "0.02" : "");
  const [side, setSide] = useState<0 | 1>(0);
  const [error, setError] = useState<string | null>(null);
  const [persisting, setPersisting] = useState(false);

  const { isConnected } = useAccount();
  const { writeContract, data: txHash, isPending, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  async function handlePersist() {
    if (!txHash || persisting) return;
    setPersisting(true);
    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId,
          side: side === 0 ? "FOR" : "AGAINST",
          amountEth: amount,
          amountWei: parseEther(amount).toString(),
          txHash,
          inviteToken,
        }),
      });
      if (!res.ok) throw new Error("Failed to save bet");
      onSuccess?.();
      handleClose();
    } catch {
      setError("Bet was placed on-chain but failed to save. Contact support.");
    } finally {
      setPersisting(false);
    }
  }

  if (isSuccess && txHash && !persisting) {
    handlePersist();
  }

  function handlePlaceBet() {
    setError(null);
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid Arbitrum Sepolia amount");
      return;
    }
    if (isJoining && Number(amount) < 0.02) {
      setError("Minimum joining stake is 0.02 Arbitrum Sepolia");
      return;
    }

    if (!contractChallengeId) {
      setError("This challenge isn't registered on-chain yet.");
      return;
    }
    try {
      writeContract({
        address: FITNESS_BET_ADDRESS,
        abi: FITNESS_BET_ABI,
        functionName: "placeBet",
        args: [BigInt(contractChallengeId), side],
        value: parseEther(amount),
      });
    } catch (err: any) {
      setError(err?.message ?? "Transaction failed");
    }
  }

  function handleClose() {
    setAmount("");
    setSide(0);
    setError(null);
    resetWrite();
    onClose();
  }

  if (!isConnected) {
    return (
      <Dialog open={open} onClose={handleClose} title="Place a Bet">
        <div className="text-center py-6">
          <Wallet size={32} className="text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">Connect your wallet to place bets.</p>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} title={isJoining ? "Join Challenge" : "Place a Bet"}>
      <div className="space-y-5">
        <p className="text-zinc-400 text-sm">
          {isJoining ? "Join: " : "Bet on: "} <span className="text-white font-medium">&quot;{challengeTitle}&quot;</span>
        </p>

        {/* Side toggle */}
        <div>
          <p className="text-sm font-medium text-zinc-300 mb-2">Your prediction</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSide(0)}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 ${side === 0
                ? "border-[#00FF87]/40 bg-[#00FF87]/10 text-[#00FF87] shadow-[0_0_20px_rgba(0,255,135,0.1)]"
                : "border-white/[0.06] text-zinc-400 hover:border-white/[0.12] hover:text-zinc-300"
                }`}
            >
              <TrendingUp size={16} />
              They&apos;ll succeed
            </button>
            <button
              onClick={() => setSide(1)}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 ${side === 1
                ? "border-red-500/40 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                : "border-white/[0.06] text-zinc-400 hover:border-white/[0.12] hover:text-zinc-300"
                }`}
            >
              <TrendingDown size={16} />
              They&apos;ll fail
            </button>
          </div>
        </div>

        <Input
          label={isJoining ? "Joining Stake (min 0.02 Arbitrum Sepolia)" : "Amount (Arbitrum Sepolia)"}
          type="number"
          step="0.001"
          min={isJoining ? "0.02" : "0.001"}
          placeholder="0.05"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          id="betAmount"
        />

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/5 border border-red-400/10 rounded-xl px-3 py-2.5">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Status */}
        {isPending && (
          <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm py-2">
            <Loader2 size={14} className="animate-spin" />
            Confirm in your wallet...
          </div>
        )}
        {isConfirming && (
          <div className="flex items-center justify-center gap-2 text-[#0066FF] text-sm py-2">
            <Loader2 size={14} className="animate-spin" />
            Waiting for confirmation...
          </div>
        )}
        {isSuccess && (
          <div className="flex items-center justify-center gap-2 text-[#00FF87] text-sm py-2">
            <CheckCircle2 size={14} />
            {isJoining ? "Joined successfully! Saving..." : "Bet placed! Saving..."}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="ghost" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <button
            onClick={handlePlaceBet}
            disabled={isPending || isConfirming || !!isSuccess}
            className="flex-1 relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#00FF87] to-[#00CC6A] px-4 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_30px_rgba(0,255,135,0.25)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {(isPending || isConfirming || persisting) && <Loader2 size={14} className="animate-spin" />}
            {isJoining ? "Confirm Join (0.02 Arbitrum Sepolia)" : (side === 0 ? "Bet FOR ✓" : "Bet AGAINST ✗")}
          </button>
        </div>

        <p className="text-xs text-zinc-500 text-center">
          Network: Arbitrum Sepolia · 2% protocol fee applied on winnings
        </p>
      </div>
    </Dialog>
  );
}
