import { TrendingUp, TrendingDown } from "lucide-react";

interface BetPoolDisplayProps {
  totalFor: string;
  totalAgainst: string;
  betCount: number;
}

function weiToEth(wei: string): string {
  if (!wei || wei === "0") return "0.000";
  return (Number(BigInt(wei)) / 1e18).toFixed(3);
}

function poolPercent(a: string, b: string): number {
  const numA = Number(BigInt(a || "0"));
  const numB = Number(BigInt(b || "0"));
  const total = numA + numB;
  if (total === 0) return 50;
  return Math.round((numA / total) * 100);
}

export function BetPoolDisplay({ totalFor, totalAgainst, betCount }: BetPoolDisplayProps) {
  const forPct = poolPercent(totalFor, totalAgainst);
  const againstPct = 100 - forPct;
  const totalEth = weiToEth(
    String(BigInt(totalFor || "0") + BigInt(totalAgainst || "0"))
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">{betCount} bets placed</span>
        <span className="text-white font-semibold">{totalEth}Arbitrum sepolia total</span>
      </div>

      {/* Pool bar with gradient segments */}
      <div className="relative flex h-3 rounded-full overflow-hidden bg-white/[0.04]">
        <div
          className="bg-gradient-to-r from-[#00FF87] to-[#00CC6A] transition-all duration-700 relative"
          style={{ width: `${forPct}%` }}
        >
          <div className="absolute inset-y-0 right-0 w-2 bg-white/20 blur-sm" />
        </div>
        <div
          className="bg-gradient-to-r from-red-500 to-red-600 transition-all duration-700 relative"
          style={{ width: `${againstPct}%` }}
        >
          <div className="absolute inset-y-0 left-0 w-2 bg-white/20 blur-sm" />
        </div>
      </div>

      <div className="flex justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#00FF87]">
          <TrendingUp size={12} />
          <span>FOR {forPct}% · {weiToEth(totalFor)} Arbitrum sepolia</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-400">
          <span>AGAINST {againstPct}% · {weiToEth(totalAgainst)} Arbitrum sepolia</span>
          <TrendingDown size={12} />
        </div>
      </div>
    </div>
  );
}
