"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StravaConnectButtonProps {
  connected: boolean;
  walletAddress?: string | null;
  onSync?: (result: { synced: number }) => void;
}

export function StravaConnectButton({ connected, onSync }: StravaConnectButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  async function handleConnect() {
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&redirect_uri=${window.location.origin}/api/strava/callback&response_type=code&scope=read,activity:read_all`;
  }

  async function handleSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/strava/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMsg(
          data.synced > 0
            ? `✓ Synced ${data.synced} new ${data.synced === 1 ? "activity" : "activities"}`
            : "✓ Already up to date"
        );
        setMsgType("success");
        onSync?.(data);
        if (data.synced > 0) setTimeout(() => window.location.reload(), 1200);
      } else {
        setSyncMsg("Sync failed — try again");
        setMsgType("error");
      }
    } catch {
      setSyncMsg("Sync failed — try again");
      setMsgType("error");
    } finally {
      setSyncing(false);
    }
  }

  if (!connected) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-zinc-400 text-sm">
          Connect your Strava account to automatically import workouts from your phone.
        </p>
        <button
          onClick={handleConnect}
          className="inline-flex items-center gap-2 bg-[#FC4C02] hover:bg-[#e04400] text-white font-semibold px-4 py-2.5 rounded-xl text-sm w-fit transition-all duration-200 hover:shadow-[0_0_20px_rgba(252,76,2,0.25)]"
        >
          <Zap size={16} />
          Connect with Strava
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[#00FF87] text-sm">
          <CheckCircle size={16} />
          <span>Strava connected</span>
        </div>
        <Button
          variant="secondary"
          onClick={handleSync}
          disabled={syncing}
          className="text-xs px-3 py-1.5"
        >
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing..." : "Sync now"}
        </Button>
      </div>
      {syncMsg && (
        <span className={`text-xs ${msgType === "success" ? "text-[#00FF87]" : "text-red-400"}`}>
          {syncMsg}
        </span>
      )}
    </div>
  );
}
