"use client";

import { useState } from "react";
import { PlaceBetDialog } from "@/components/betting/PlaceBetDialog";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FITNESS_BET_ADDRESS, FITNESS_BET_ABI } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { ChallengeStatus } from "@prisma/client";
import { CheckCircle, XCircle, TrendingUp, Link2, Copy, Check, Lock } from "lucide-react";
import { keccak256, toBytes, parseEther } from "viem";

interface ChallengeActionsProps {
  challengeId: string;
  contractChallengeId: string | null;
  challengeTitle: string;
  isOwner: boolean;
  status: ChallengeStatus;
  pastDeadline: boolean;
  hasExistingBet: boolean;
  deadline: Date;
  inviteToken?: string | null;
  userBetSide?: "FOR" | "AGAINST" | null;
}

export function ChallengeActions({
  challengeId,
  contractChallengeId,
  challengeTitle,
  isOwner,
  status,
  pastDeadline,
  hasExistingBet,
  deadline,
  inviteToken,
  userBetSide,
}: ChallengeActionsProps) {
  const router = useRouter();
  const [betOpen, setBetOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [copied, setCopied] = useState(false);

  const { writeContract: writeReport, data: reportTxHash, isPending: reportPending } = useWriteContract();
  useWaitForTransactionReceipt({ hash: reportTxHash });

  const { writeContract: writeClaim, data: claimTxHash, isPending: claimPending } = useWriteContract();
  const { isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimTxHash });

  const { writeContract: writeRegister, data: registerTxHash, isPending: registerPending } = useWriteContract();
  const { isSuccess: registerSuccess, data: registerReceipt } = useWaitForTransactionReceipt({ hash: registerTxHash });

  async function handleCopyInviteLink() {
    if (!inviteToken) return;
    const url = `${window.location.origin}/challenges/${challengeId}?invite=${inviteToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleResolve(succeeded: boolean) {
    setResolving(true);
    try {
      if (contractChallengeId) {
        writeReport({
          address: FITNESS_BET_ADDRESS,
          abi: FITNESS_BET_ABI,
          functionName: "reportOutcome",
          args: [BigInt(contractChallengeId), succeeded],
        });
      }

      const res = await fetch(`/api/challenges/${challengeId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ succeeded, txHash: reportTxHash }),
      });
      if (!res.ok) throw new Error("Failed to resolve");
      window.location.reload();
    } catch {
      alert("Failed to resolve challenge");
    } finally {
      setResolving(false);
    }
  }

  function handleClaim() {
    if (!contractChallengeId) return;
    setClaimLoading(true);
    writeClaim({
      address: FITNESS_BET_ADDRESS,
      abi: FITNESS_BET_ABI,
      functionName: "claimWinnings",
      args: [BigInt(contractChallengeId)],
    });
  }

  async function handleRegisterOnChain() {
    setRegistering(true);
    try {
      const deadlineUnix = BigInt(Math.floor(deadline.getTime() / 1000));
      const goalId = keccak256(toBytes(challengeTitle + challengeId));

      writeRegister({
        address: FITNESS_BET_ADDRESS,
        abi: FITNESS_BET_ABI,
        functionName: "createChallenge",
        args: [goalId, deadlineUnix],
        value: parseEther("0.02"),
      });
    } catch (err: any) {
      alert("Failed to register on-chain: " + (err?.message ?? "unknown error"));
      setRegistering(false);
    }
  }

  // Auto-save registration to DB after tx success
  if (registerSuccess && registerReceipt && registering) {
    (async () => {
      try {
        const log = registerReceipt.logs[0];
        const contractChallengeId = log?.topics?.[1] ? String(BigInt(log.topics[1])) : undefined;

        if (!contractChallengeId) throw new Error("Failed to extract challenge ID");

        const res = await fetch(`/api/challenges/${challengeId}/register`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractChallengeId,
            txHash: registerTxHash,
          }),
        });

        if (!res.ok) throw new Error("Failed to save registration");

        router.refresh();
      } catch (err: any) {
        alert("Registered on-chain but failed to save: " + (err?.message ?? "unknown error"));
      } finally {
        setRegistering(false);
      }
    })();
  }

  if (claimSuccess) {
    return (
      <div className="bg-[#00FF87]/10 border border-[#00FF87]/20 rounded-2xl p-5 text-center shadow-[0_0_20px_rgba(0,255,135,0.1)]">
        <CheckCircle className="text-[#00FF87] mx-auto mb-2" size={24} />
        <p className="text-[#00FF87] font-medium">Winnings claimed!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Initialized — waiting for bets */}
      {isOwner && status === "INITIALIZED" && (
        <div className="rounded-2xl border border-white/[0.06] bg-[#111111] p-5 text-center">
          <div className="text-zinc-400 text-sm">
            <span className="text-white font-medium">Initialized</span> — share your invite link to get bets. Challenge becomes <span className="text-[#00FF87] font-medium">Active</span> when the first bet is placed.
          </div>
        </div>
      )}

      {/* Resolved — winner claimed */}
      {status === "RESOLVED" && (
        <div className="bg-[#00FF87]/10 border border-[#00FF87]/20 rounded-2xl p-5 text-center shadow-[0_0_20px_rgba(0,255,135,0.1)]">
          <CheckCircle className="text-[#00FF87] mx-auto mb-2" size={24} />
          <p className="text-[#00FF87] font-medium">Challenge Resolved</p>
          <p className="text-zinc-400 text-sm mt-1">Winnings have been claimed.</p>
        </div>
      )}

      {/* Share invite link — owner, INITIALIZED or ACTIVE */}
      {isOwner && (status === "ACTIVE" || status === "INITIALIZED") && inviteToken && (
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Link2 size={16} className="text-purple-400" />
            <h3 className="text-purple-400 font-medium">Share Invite Link</h3>
          </div>
          <p className="text-zinc-400 text-sm mb-3">
            only people with this link can join and place bets.
          </p>
          <Button
            onClick={handleCopyInviteLink}
            variant="secondary"
            className="w-full"
          >
            {copied ? <Check size={16} className="text-[#00FF87]" /> : <Copy size={16} />}
            {copied ? "Link copied!" : "Copy Invite Link"}
          </Button>
        </div>
      )}

      {/* Register on-chain — owner, INITIALIZED or ACTIVE, not registered */}
      {isOwner && (status === "ACTIVE" || status === "INITIALIZED") && !contractChallengeId && (
        <div className="rounded-2xl border border-[#0066FF]/20 bg-[#0066FF]/5 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Link2 size={16} className="text-[#0066FF]" />
            <h3 className="text-[#0066FF] font-medium">Register On-Chain</h3>
          </div>
          <p className="text-zinc-400 text-sm mb-3">
            Register to enable betting. Stake: 0.02 tBNB.
          </p>
          <Button
            onClick={handleRegisterOnChain}
            loading={registerPending || registering}
            className="w-full bg-[#0066FF] hover:bg-[#0066FF]/90 text-white"
          >
            {registerPending ? "Confirm in wallet..." : registering ? "Registering..." : "Register On-Chain (0.02 tBNB)"}
          </Button>
        </div>
      )}

      {/* Place bet / Join — non-owner, has valid invite, INITIALIZED or ACTIVE, before deadline */}
      {!isOwner && (status === "ACTIVE" || status === "INITIALIZED") && !pastDeadline && inviteToken && (
        <>
          <Button className="w-full" onClick={() => setBetOpen(true)}>
            <TrendingUp size={16} />
            {hasExistingBet ? "Place a Bet" : "Join Challenge (0.02 tBNB)"}
          </Button>
          <PlaceBetDialog
            open={betOpen}
            onClose={() => setBetOpen(false)}
            challengeId={challengeId}
            contractChallengeId={contractChallengeId}
            challengeTitle={challengeTitle}
            inviteToken={inviteToken}
            onSuccess={() => router.refresh()}
            isJoining={!hasExistingBet}
          />
        </>
      )}

      {/* No invite — non-owner sees a locked message */}
      {!isOwner && (status === "ACTIVE" || status === "INITIALIZED") && !pastDeadline && !hasExistingBet && !inviteToken && (
        <div className="rounded-2xl border border-white/[0.06] bg-[#111111] p-5 text-center">
          <Lock size={20} className="text-zinc-500 mx-auto mb-2" />
          <p className="text-zinc-400 text-sm">
            Betting is invite-only. Ask the challenge creator for an invite link.
          </p>
        </div>
      )}

      {/* Report outcome — owner, active, past deadline */}
      {isOwner && status === "ACTIVE" && pastDeadline && (
        <div className="rounded-2xl border border-white/[0.06] bg-[#111111] p-5">
          <h3 className="text-white font-medium mb-1">Report Outcome</h3>
          <p className="text-zinc-400 text-sm mb-4">
            Did you complete your challenge? Winners will be able to claim their payouts immediately.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => handleResolve(true)}
              loading={resolving || reportPending}
              className="flex-1"
            >
              <CheckCircle size={16} />
              I succeeded!
            </Button>
            <Button
              variant="danger"
              onClick={() => handleResolve(false)}
              loading={resolving || reportPending}
              className="flex-1"
            >
              <XCircle size={16} />
              I failed
            </Button>
          </div>
        </div>
      )}

      {/* Claim winnings — resolved, has bet, on-chain, AND WON */}
      {((status === "COMPLETED" && userBetSide === "FOR") || (status === "FAILED" && userBetSide === "AGAINST")) && contractChallengeId && hasExistingBet && (
        <Button
          className="w-full"
          onClick={handleClaim}
          loading={claimLoading || claimPending}
        >
          Claim Winnings
        </Button>
      )}

      {/* Challenge failed — show result */}
      {status === "FAILED" && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 text-center">
          <XCircle className="text-red-400 mx-auto mb-2" size={24} />
          <p className="text-red-400 font-medium">Challenge failed</p>
          <p className="text-zinc-400 text-sm mt-1">The creator did not complete their goal.</p>
        </div>
      )}
    </div>
  );
}
