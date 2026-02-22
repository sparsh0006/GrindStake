/**
 * Strava Webhook Subscription Setup Script
 * 
 * Run this ONCE after deploying to register your webhook with Strava.
 * 
 * Usage:
 *   node scripts/setup-strava-webhook.mjs
 * 
 * Prerequisites:
 *   - App must be deployed and publicly accessible
 *   - STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET must be set
 *   - STRAVA_WEBHOOK_VERIFY_TOKEN must be set (any string you choose)
 *   - NEXT_PUBLIC_APP_URL must be your public domain (e.g. https://grindstake.com)
 * 
 * Strava limits: 1 webhook subscription per app. To update, delete the old one first.
 */

const CLIENT_ID = process.env.STRAVA_CLIENT_ID
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET
const VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || 'GRINDSTAKE_WEBHOOK'
const CALLBACK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/strava/webhook`

async function setupWebhook() {
    console.log('=== Strava Webhook Setup ===')
    console.log(`Callback URL: ${CALLBACK_URL}`)
    console.log(`Verify Token: ${VERIFY_TOKEN}`)
    console.log()

    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error('Missing STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET in environment')
        process.exit(1)
    }

    // 1. Check existing subscriptions
    console.log('Checking existing subscriptions...')
    const checkRes = await fetch(
        `https://www.strava.com/api/v3/push_subscriptions?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    )
    const existing = await checkRes.json()
    console.log('Existing:', JSON.stringify(existing, null, 2))

    if (Array.isArray(existing) && existing.length > 0) {
        console.log('\nSubscription already exists! To recreate, delete it first:')
        console.log(`  curl -X DELETE "https://www.strava.com/api/v3/push_subscriptions/${existing[0].id}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}"`)
        return
    }

    // 2. Create new subscription
    console.log('\nCreating webhook subscription...')
    const res = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            callback_url: CALLBACK_URL,
            verify_token: VERIFY_TOKEN,
        }),
    })

    const result = await res.json()

    if (res.ok) {
        console.log('✅ Webhook registered successfully!')
        console.log('Subscription ID:', result.id)
    } else {
        console.error('❌ Failed to register webhook:')
        console.error(JSON.stringify(result, null, 2))
    }
}

setupWebhook().catch(console.error)
