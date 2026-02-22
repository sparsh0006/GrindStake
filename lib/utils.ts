import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEth(wei: string): string {
  const eth = Number(BigInt(wei)) / 1e18;
  return eth.toFixed(4);
}

export function calculateStreak(workoutDates: Date[]): number {
  if (workoutDates.length === 0) return 0;
  const days = new Set(
    workoutDates.map((d) => new Date(d).toISOString().split("T")[0])
  );
  const sorted = Array.from(days).sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export function progressPercent(current: number, target: number): number {
  return Math.min(100, Math.round((current / target) * 100));
}

export function daysLeft(deadline: Date): number {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
}
