// lib/strava.ts
import { prisma } from '@/lib/db'

const CLIENT_ID = process.env.STRAVA_CLIENT_ID
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET

export const getStravaAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/strava/callback`,
    response_type: 'code',
    scope: 'read,activity:read_all',
  })
  return `https://www.strava.com/oauth/authorize?${params.toString()}`
}

// Exchange initial code for tokens
export const exchangeToken = async (code: string) => {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) throw new Error('Failed to exchange Strava token')
  return res.json()
}

// Refresh token if expired — uses correct field name: stravaTokenExpiry
export const getValidToken = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.stravaRefreshToken) throw new Error('User not connected to Strava')

  // If token is still valid (with 5 min buffer), return it
  if (user.stravaTokenExpiry && user.stravaTokenExpiry > new Date(Date.now() + 5 * 60 * 1000)) {
    return user.stravaAccessToken
  }

  // Refresh the token
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: user.stravaRefreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) throw new Error('Failed to refresh Strava token')
  const data = await res.json()

  // Update DB with new tokens — uses correct field name: stravaTokenExpiry
  await prisma.user.update({
    where: { id: userId },
    data: {
      stravaAccessToken: data.access_token,
      stravaRefreshToken: data.refresh_token,
      stravaTokenExpiry: new Date(data.expires_at * 1000),
    },
  })

  return data.access_token
}

export const fetchActivities = async (accessToken: string, afterTimestamp?: number) => {
  const params = new URLSearchParams({ per_page: '50' })
  if (afterTimestamp) params.set('after', String(afterTimestamp))

  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) throw new Error('Failed to fetch activities')
  return res.json()
}