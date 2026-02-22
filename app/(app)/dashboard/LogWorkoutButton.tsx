"use client";

import { useState } from "react";
import { WorkoutForm } from "@/components/fitness/WorkoutForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogWorkoutButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button onClick={() => setOpen(true)} className="text-xs px-3 py-2">
        <Plus size={16} />
        Log workout
      </Button>
      <WorkoutForm
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
