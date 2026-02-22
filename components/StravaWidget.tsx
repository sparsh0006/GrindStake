'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Loader2, RefreshCw, Activity, Wifi, WifiOff } from 'lucide-react'

export function StravaWidget({ isConnectedToStrava }: { isConnectedToStrava: boolean }) {
    const { address } = useAccount()
    const [syncing, setSyncing] = useState(false)
    const [lastSync, setLastSync] = useState<string | null>(null)

    const handleConnect = () => {
        window.location.href = `https://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&redirect_uri=${window.location.origin}/api/strava/callback&response_type=code&scope=read,activity:read_all`
    }

    const handleSync = async () => {
        if (!address) return
        setSyncing(true)
        try {
            const res = await fetch('/api/strava/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address })
            })
            const data = await res.json()
            setLastSync(`Synced ${data.synced} activities`)
            window.location.reload()
        } catch (e) {
            alert('Sync failed')
        } finally {
            setSyncing(false)
        }
    }

    if (!isConnectedToStrava) {
        return (
            <div className="rounded-2xl border border-white/[0.06] bg-[#111111] p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                    <WifiOff size={20} className="text-zinc-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Connect Strava</h3>
                <p className="text-zinc-500 text-sm mb-4">Track your workouts automatically.</p>
                <button
                    onClick={handleConnect}
                    className="bg-[#FC4C02] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#E34402] transition-all duration-200 hover:shadow-[0_0_20px_rgba(252,76,2,0.25)]"
                >
                    Connect with Strava
                </button>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-white/[0.06] bg-[#111111] p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="relative">
                        <Activity className="text-[#FC4C02]" size={20} />
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00FF87] shadow-[0_0_6px_rgba(0,255,135,0.8)] animate-pulse" />
                    </div>
                    Strava Connected
                </h3>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="text-sm flex items-center gap-1.5 text-[#00FF87] hover:text-[#00FF87]/80 disabled:opacity-50 transition-colors px-3 py-1.5 rounded-lg hover:bg-[#00FF87]/5"
                >
                    {syncing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />}
                    {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
            </div>

            {lastSync && (
                <p className="text-xs text-[#00FF87] mb-2 bg-[#00FF87]/5 rounded-lg px-3 py-1.5 inline-block">
                    ✓ {lastSync}
                </p>
            )}

            <div className="space-y-2">
                <p className="text-sm text-zinc-500">Activities will appear here after sync.</p>
            </div>
        </div>
    )
}