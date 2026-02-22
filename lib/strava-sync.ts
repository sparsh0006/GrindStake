// lib/strava-sync.ts
// Shared Strava activity sync logic — used by both manual sync and webhooks

import { prisma } from '@/lib/db'
import { autoLinkAndUpdateChallenges } from '@/lib/progressUtils'
import { WorkoutType } from '@prisma/client'

const mapStravaTypeToEnum = (type: string): WorkoutType => {
    switch (type) {
        case 'Run': return 'RUN'
        case 'Ride': return 'RIDE'
        case 'Swim': return 'SWIM'
        case 'Walk': return 'WALK'
        case 'Hike': return 'HIKE'
        case 'WeightTraining': return 'WEIGHT_TRAINING'
        case 'Yoga': return 'YOGA'
        case 'Crossfit': return 'CROSSFIT'
        default: return 'OTHER'
    }
}

/**
 * Upsert a single Strava activity into the database,
 * then auto-link to challenges and create check-ins.
 */
export async function syncSingleActivity(
    userId: string,
    accessToken: string,
    stravaActivityId: string
) {
    // Fetch the full activity from Strava
    const res = await fetch(
        `https://www.strava.com/api/v3/activities/${stravaActivityId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!res.ok) {
        console.error(`[Strava Sync] Failed to fetch activity ${stravaActivityId}: ${res.status}`)
        return
    }

    const act = await res.json()

    await prisma.workout.upsert({
        where: { stravaActivityId: String(act.id) },
        create: {
            userId,
            stravaActivityId: String(act.id),
            name: act.name,
            workoutType: mapStravaTypeToEnum(act.type ?? act.sport_type),
            source: 'STRAVA',
            startTime: new Date(act.start_date),
            endTime: new Date(new Date(act.start_date).getTime() + (act.elapsed_time * 1000)),
            durationSeconds: act.elapsed_time,
            movingTime: act.moving_time,
            distanceMeters: act.distance,
            elevationGainM: act.total_elevation_gain,
            caloriesBurned: act.kilojoules ? Math.round(act.kilojoules * 0.239) : null,
            avgHeartRate: act.average_heartrate ? Math.round(act.average_heartrate) : null,
            mapPolyline: act.map?.summary_polyline || null,
            stravaData: act,
        },
        update: {
            name: act.name,
            durationSeconds: act.elapsed_time,
            movingTime: act.moving_time,
            distanceMeters: act.distance,
            elevationGainM: act.total_elevation_gain,
            caloriesBurned: act.kilojoules ? Math.round(act.kilojoules * 0.239) : null,
            avgHeartRate: act.average_heartrate ? Math.round(act.average_heartrate) : null,
            stravaData: act,
        },
    })

    // Auto-link to challenges & create check-ins for multi-day challenges
    await autoLinkAndUpdateChallenges(userId)

    console.log(`[Strava Sync] Synced activity ${stravaActivityId} for user ${userId}`)
}
