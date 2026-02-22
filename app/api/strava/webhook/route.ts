// app/api/strava/webhook/route.ts
// Strava Webhook — receives real-time activity events
//
// GET  → subscription validation (Strava sends hub.challenge)
// POST → event notification (activity created/updated/deleted)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getValidToken } from '@/lib/strava'
import { syncSingleActivity } from '@/lib/strava-sync'

const VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN ?? 'GRINDSTAKE_WEBHOOK'

// ─── Subscription validation (one-time during setup) ─────────────
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
        console.log('[Strava Webhook] Subscription validated')
        return NextResponse.json({ 'hub.challenge': challenge })
    }

    return NextResponse.json({ error: 'Invalid verification' }, { status: 403 })
}

// ─── Event handler ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        console.log('[Strava Webhook] Event:', JSON.stringify(body))

        // We only care about activity events
        if (body.object_type !== 'activity') {
            return NextResponse.json({ ok: true })
        }

        const stravaAthleteId = String(body.owner_id)
        const stravaActivityId = String(body.object_id)
        const aspectType = body.aspect_type as 'create' | 'update' | 'delete'

        // Find the user by their Strava athlete ID
        const user = await prisma.user.findFirst({
            where: { stravaId: stravaAthleteId },
            select: { id: true, stravaAccessToken: true, stravaConnected: true },
        })

        if (!user || !user.stravaConnected) {
            console.log('[Strava Webhook] Unknown athlete:', stravaAthleteId)
            return NextResponse.json({ ok: true })
        }

        if (aspectType === 'delete') {
            // Delete the workout if it exists
            await prisma.workout.deleteMany({
                where: { stravaActivityId, userId: user.id },
            })
            console.log('[Strava Webhook] Deleted activity:', stravaActivityId)
            return NextResponse.json({ ok: true })
        }

        // For create/update: fetch the full activity and process it
        const token = await getValidToken(user.id)
        await syncSingleActivity(user.id, token as string, stravaActivityId)

        return NextResponse.json({ ok: true })
    } catch (e) {
        console.error('[Strava Webhook] Error:', e)
        // Always return 200 to Strava — otherwise they'll retry and eventually disable the webhook
        return NextResponse.json({ ok: true })
    }
}
