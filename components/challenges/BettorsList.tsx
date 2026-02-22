"use client";

import { useReadContract } from "wagmi";
import { FITNESS_BET_ADDRESS, FITNESS_BET_ABI } from "@/lib/contract";
import { Users } from "lucide-react";

interface BettorsListProps {
    challengeId: string;
    contractChallengeId: string | null;
}

export function BettorsList({ challengeId, contractChallengeId }: BettorsListProps) {
    const { data: bettors } = useReadContract({
        address: FITNESS_BET_ADDRESS,
        abi: FITNESS_BET_ABI,
        functionName: "getBettors",
        args: contractChallengeId ? [BigInt(contractChallengeId)] : undefined,
        query: {
            enabled: !!contractChallengeId,
        },
    });

    if (!contractChallengeId || !bettors || bettors.length === 0) {
        return null;
    }

    // Format address (0x1234...5678)
    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <div className="rounded-2xl border border-white/[0.06] bg-[#111111] p-5">
            <div className="flex items-center gap-2 mb-4 text-zinc-400">
                <Users size={18} />
                <h3 className="font-medium text-sm">Joined Participants ({bettors.length})</h3>
            </div>

            <div className="space-y-2">
                {bettors.map((bettor) => (
                    <div
                        key={bettor}
                        className="flex items-center justify-between bg-white/[0.04] rounded-xl px-3 py-2.5"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00FF87] to-[#00CC6A] flex items-center justify-center text-[10px] text-black font-bold">
                                {bettor.slice(2, 4).toUpperCase()}
                            </div>
                            <span className="text-zinc-300 text-sm font-mono">
                                {formatAddress(bettor)}
                            </span>
                        </div>
                        {/* 
              We could fetch bet details here if needed, but for now just showing list 
              as per strict request.
            */}
                    </div>
                ))}
            </div>
        </div>
    );
}
