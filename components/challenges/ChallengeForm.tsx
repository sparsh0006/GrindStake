"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { keccak256, toBytes, parseEther } from "viem";
import { useRouter } from "next/navigation";
import { FITNESS_BET_ADDRESS, FITNESS_BET_ABI } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GOAL_TYPE_LABELS } from "@/types";
import type { GoalType } from "@prisma/client";
import { AlertCircle, CheckCircle, CalendarDays } from "lucide-react";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().optional(),
  goalType: z.enum(["DISTANCE_KM", "WEIGHT_LOSS_KG", "WORKOUT_COUNT", "CALORIES_BURNED", "CUSTOM"]),
  goalTarget: z.number().positive("Target must be positive"),
  days: z.number().int().min(1, "At least 1 day"),
  deadline: z.string().refine((d) => new Date(d) > new Date(), "Deadline must be in the future"),
  checkInSource: z.enum(["MANUAL", "STRAVA"]),
});

type FormData = z.infer<typeof schema>;

const goalUnitMap: Record<GoalType, string> = {
  DISTANCE_KM: "km",
  WEIGHT_LOSS_KG: "kg",
  WORKOUT_COUNT: "workouts",
  CALORIES_BURNED: "kcal",
  CUSTOM: "units",
};

export function ChallengeForm() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "tx" | "saving">("form");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  const { isConnected } = useAccount();
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash: txHash });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { goalType: "DISTANCE_KM", days: 1, checkInSource: "MANUAL" },
  });

  const goalType = watch("goalType") as GoalType;
  const days = watch("days") ?? 1;
  const isMultiDay = days > 1;

  // Auto-set deadline when days changes
  function handleDaysChange(val: number) {
    if (val > 0) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + val);
      deadline.setHours(23, 59);
      // Format as datetime-local value
      const pad = (n: number) => String(n).padStart(2, "0");
      const formatted = `${deadline.getFullYear()}-${pad(deadline.getMonth() + 1)}-${pad(deadline.getDate())}T${pad(deadline.getHours())}:${pad(deadline.getMinutes())}`;
      setValue("deadline", formatted);
    }
  }

  async function onFormSubmit(data: FormData) {
    setError(null);
    setFormData(data);

    if (!isConnected) {
      await saveChallenge(data, undefined, undefined);
      return;
    }

    setStep("tx");
    try {
      const deadline = BigInt(Math.floor(new Date(data.deadline).getTime() / 1000));
      const goalId = keccak256(toBytes(data.title + Date.now()));
      writeContract({
        address: FITNESS_BET_ADDRESS,
        abi: FITNESS_BET_ABI,
        functionName: "createChallenge",
        args: [goalId, deadline],
        value: parseEther("0.02"),
      });
    } catch (err: any) {
      setError("Transaction failed: " + (err?.message ?? "unknown error"));
      setStep("form");
    }
  }

  if (isSuccess && receipt && formData && step === "tx") {
    setStep("saving");
    const log = receipt.logs[0];
    const contractChallengeId = log?.topics?.[1] ? String(BigInt(log.topics[1])) : undefined;
    saveChallenge(formData, txHash, contractChallengeId);
  }

  async function saveChallenge(
    data: FormData,
    txHash: string | undefined,
    contractChallengeId: string | undefined
  ) {
    setStep("saving");
    try {
      const multiDay = (data.days ?? 1) > 1;
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          challengeMode: multiDay ? "MULTI_DAY" : "SINGLE_DAY",
          goalType: multiDay ? "WORKOUT_COUNT" : data.goalType,
          goalTarget: multiDay ? data.days : data.goalTarget,
          goalUnit: multiDay ? "days" : goalUnitMap[data.goalType as GoalType],
          deadline: new Date(data.deadline).toISOString(),
          checkInSource: data.checkInSource,
          txHash,
          contractChallengeId,
        }),
      });
      if (!res.ok) throw new Error("Failed to create challenge");
      const challenge = await res.json();
      router.push(`/challenges/${challenge.id}`);
    } catch {
      setError("Challenge created on-chain but failed to save. Please try again.");
      setStep("form");
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      <Input
        label="Challenge title"
        placeholder='e.g. "Run 100km in 30 days"'
        id="title"
        {...register("title")}
        error={errors.title?.message}
      />

      <div>
        <label className="text-sm font-medium text-zinc-300 block mb-1.5">
          Goal type
        </label>
        <select
          {...register("goalType")}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00FF87]/40 focus:border-[#00FF87]/30 transition-all"
        >
          {(Object.keys(GOAL_TYPE_LABELS) as GoalType[]).map((k) => (
            <option key={k} value={k}>
              {GOAL_TYPE_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label={`Target (${goalUnitMap[goalType]})`}
          type="number"
          step="0.1"
          min="0.1"
          placeholder="100"
          id="goalTarget"
          {...register("goalTarget", { valueAsNumber: true })}
          error={errors.goalTarget?.message}
        />
        <Input
          label="Days"
          type="number"
          min="1"
          step="1"
          placeholder="1"
          id="days"
          {...register("days", {
            valueAsNumber: true,
            onChange: (e) => handleDaysChange(Number(e.target.value)),
          })}
          error={errors.days?.message}
        />
        <Input
          label="Deadline"
          type="datetime-local"
          id="deadline"
          {...register("deadline")}
          error={errors.deadline?.message}
        />
      </div>

      {isMultiDay && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-2.5 text-purple-400">
            <CalendarDays size={16} />
            <span>
              <strong>Multi-day challenge</strong> — you'll need to check in ({days} days total)
            </span>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
            <label className="text-sm font-medium text-zinc-300 block mb-3">
              How will you check in?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("checkInSource", "MANUAL")}
                className={`flex flex-col items-center gap-2 py-3 rounded-lg border text-sm font-medium transition-all ${watch("checkInSource") === "MANUAL"
                  ? "bg-[#00FF87]/10 border-[#00FF87]/40 text-[#00FF87]"
                  : "border-white/[0.1] text-zinc-400 hover:bg-white/[0.05]"
                  }`}
              >
                <div className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center">
                  <CheckCircle size={16} />
                </div>
                Manual Check-in
              </button>
              <button
                type="button"
                onClick={() => setValue("checkInSource", "STRAVA")}
                className={`flex flex-col items-center gap-2 py-3 rounded-lg border text-sm font-medium transition-all ${watch("checkInSource") === "STRAVA"
                  ? "bg-[#FC4C02]/10 border-[#FC4C02]/40 text-[#FC4C02]"
                  : "border-white/[0.1] text-zinc-400 hover:bg-white/[0.05]"
                  }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#FC4C02]/20 flex items-center justify-center">
                  <span className="font-bold text-[#FC4C02] text-xs">S</span>
                </div>
                Auto via Strava
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              {watch("checkInSource") === "MANUAL"
                ? "You'll need to manually click 'Check In' button each day."
                : "Your runs/workouts from Strava will automatically mark the calendar."}
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-zinc-300 block mb-1.5">
          Description (optional)
        </label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="What's the story behind this challenge?"
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00FF87]/40 focus:border-[#00FF87]/30 resize-none transition-all"
        />
      </div>

      {
        error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )
      }

      {
        step === "tx" && (
          <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-400/10 rounded-lg px-3 py-2">
            <span className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            {isPending ? "Confirm in your wallet..." : isConfirming ? "Waiting for confirmation..." : "Processing..."}
          </div>
        )
      }

      {
        step === "saving" && (
          <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 rounded-lg px-3 py-2">
            <CheckCircle size={14} />
            Saving your challenge...
          </div>
        )
      }

      {
        !isConnected && (
          <p className="text-xs text-zinc-500">
            Not connected to wallet — challenge will be created without on-chain registration. Connect wallet to enable betting.
          </p>
        )
      }

      <Button
        type="submit"
        className="w-full"
        loading={step !== "form"}
        disabled={step !== "form"}
      >
        {isConnected ? "Create Challenge (Stake 0.02 tBNB)" : "Create Challenge"}
      </Button>
    </form >
  );
}
