// app/api/strava/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { exchangeToken } from '@/lib/strava'

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl
    const code = searchParams.get('code')

    if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 })

    // Get the logged-in user from session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    try {
        const data = await exchangeToken(code)

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                stravaId: String(data.athlete.id),
                stravaAccessToken: data.access_token,
                stravaRefreshToken: data.refresh_token,
                stravaTokenExpiry: new Date(data.expires_at * 1000),
                stravaConnected: true,
            },
        })

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?strava=connected`)
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Strava auth failed' }, { status: 500 })
    }
}