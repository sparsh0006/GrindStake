"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { WORKOUT_TYPE_LABELS } from "@/types";
import type { WorkoutType } from "@prisma/client";

const schema = z.object({
  workoutType: z.enum([
    "RUN", "RIDE", "SWIM", "WALK", "HIKE",
    "WEIGHT_TRAINING", "YOGA", "CROSSFIT", "SPORT", "OTHER",
  ]),
  startTime: z.string(),
  durationMinutes: z.number().min(1).optional(),
  distanceKm: z.number().min(0).optional(),
  caloriesBurned: z.number().min(0).optional(),
  weightKg: z.number().min(0).optional(),
  challengeId: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface WorkoutFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  challengeId?: string;
}

export function WorkoutForm({ open, onClose, onSuccess, challengeId }: WorkoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      workoutType: "RUN",
      startTime: new Date().toISOString().slice(0, 16),
      challengeId,
    },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutType: data.workoutType,
          startTime: new Date(data.startTime).toISOString(),
          durationSeconds: data.durationMinutes ? data.durationMinutes * 60 : undefined,
          distanceMeters: data.distanceKm ? data.distanceKm * 1000 : undefined,
          caloriesBurned: data.caloriesBurned,
          weightKg: data.weightKg,
          challengeId: data.challengeId || undefined,
          notes: data.notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to log workout");
      reset();
      onSuccess();
      onClose();
    } catch {
      setError("Failed to log workout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Log Workout">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-zinc-300 block mb-1.5">
            Workout type
          </label>
          <select
            {...register("workoutType")}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00FF87]/40 focus:border-[#00FF87]/30 transition-all"
          >
            {(Object.keys(WORKOUT_TYPE_LABELS) as WorkoutType[]).map((k) => (
              <option key={k} value={k}>
                {WORKOUT_TYPE_LABELS[k]}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Date & time"
          type="datetime-local"
          id="startTime"
          {...register("startTime")}
          error={errors.startTime?.message}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Duration (min)"
            type="number"
            placeholder="30"
            id="durationMinutes"
            {...register("durationMinutes", { valueAsNumber: true })}
          />
          <Input
            label="Distance (km)"
            type="number"
            step="0.1"
            placeholder="5.0"
            id="distanceKm"
            {...register("distanceKm", { valueAsNumber: true })}
          />
          <Input
            label="Calories"
            type="number"
            placeholder="300"
            id="caloriesBurned"
            {...register("caloriesBurned", { valueAsNumber: true })}
          />
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            placeholder="75.0"
            id="weightKg"
            {...register("weightKg", { valueAsNumber: true })}
          />
        </div>
        <Input
          label="Notes (optional)"
          type="text"
          placeholder="How did it feel?"
          id="notes"
          {...register("notes")}
        />

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={loading}>
            Log workout
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
