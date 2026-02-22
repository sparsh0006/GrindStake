// app/api/strava/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidToken, fetchActivities } from '@/lib/strava'
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

export async function POST(req: NextRequest) {
  try {
    // Use session — no need to pass walletAddress in body
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        stravaAccessToken: true,
        stravaRefreshToken: true,
        stravaConnected: true,
        lastStravaSync: true,
      }
    })

    if (!user || !user.stravaConnected || !user.stravaAccessToken) {
      return NextResponse.json({ error: 'User not connected to Strava' }, { status: 401 })
    }

    // Get a valid (possibly refreshed) token
    const token = await getValidToken(user.id)

    // Only fetch activities since last sync (incremental) — or all if first sync
    const afterTimestamp = user.lastStravaSync
      ? Math.floor(user.lastStravaSync.getTime() / 1000)
      : undefined

    const activities = await fetchActivities(token as string, afterTimestamp)

    let count = 0

    for (const act of activities) {
      await prisma.workout.upsert({
        where: { stravaActivityId: String(act.id) },
        create: {
          userId: user.id,
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
        }
      })
      count++
    }

    // Update last sync time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastStravaSync: new Date() }
    })

    // Auto-link new workouts to active challenges & recalculate progress
    await autoLinkAndUpdateChallenges(user.id)

    return NextResponse.json({ synced: count })
  } catch (e) {
    console.error('Strava Sync Error:', e)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}