/**
 * MongoDB Atlas IP Access List Management Scripts
 *
 * Usage:
 *   npx tsx scripts/atlas-ip.ts allow   # Add 0.0.0.0/0 for 6 hours
 *   npx tsx scripts/atlas-ip.ts remove  # Remove 0.0.0.0/0
 */

import 'dotenv/config'
import DigestClient from 'digest-fetch'

const GROUP_ID = process.env.MONGODB_ATLAS_GROUP_ID
const PUBLIC_KEY = process.env.MONGODB_ATLAS_PUBLIC_KEY
const PRIVATE_KEY = process.env.MONGODB_ATLAS_PRIVATE_KEY

if (!GROUP_ID || !PUBLIC_KEY || !PRIVATE_KEY) {
  console.error('Missing environment variables. Please set:')
  console.error('  MONGODB_ATLAS_GROUP_ID')
  console.error('  MONGODB_ATLAS_PUBLIC_KEY')
  console.error('  MONGODB_ATLAS_PRIVATE_KEY')
  process.exit(1)
}

const BASE_URL = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${GROUP_ID}/accessList`

// Digest認証クライアントを作成
const client = new DigestClient(PUBLIC_KEY, PRIVATE_KEY)

async function allowAllIPs() {
  const deleteAfter = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
  console.log(`Adding 0.0.0.0/0 to allow list for 6 hours (until ${deleteAfter})...`)

  const body = JSON.stringify([
    {
      cidrBlock: '0.0.0.0/0',
      comment: 'Temporary build access (Auto-added)',
      deleteAfterDate: deleteAfter,
    },
  ])

  const res = await client.fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  if (res.status === 201 || res.status === 200) {
    console.log('✅ Successfully added 0.0.0.0/0 to the access list.')
  } else {
    const data = await res.json().catch(() => ({}))
    console.error('❌ Failed to add IP:', data)
    process.exit(1)
  }
}

async function removeAllIPs() {
  console.log('Removing 0.0.0.0/0 from allow list...')

  const url = `${BASE_URL}/0.0.0.0%2F0`
  const res = await client.fetch(url, { method: 'DELETE' })

  if (res.status === 204 || res.status === 200) {
    console.log('✅ Successfully removed 0.0.0.0/0 from the access list.')
  } else if (res.status === 404) {
    console.log('ℹ️ 0.0.0.0/0 was not in the access list (already removed).')
  } else {
    const data = await res.json().catch(() => ({}))
    console.error('❌ Failed to remove IP:', data)
    process.exit(1)
  }
}

// メイン処理
const command = process.argv[2]

if (command === 'allow') {
  allowAllIPs()
} else if (command === 'remove') {
  removeAllIPs()
} else {
  console.log('Usage: npx tsx scripts/atlas-ip.ts [allow|remove]')
  console.log('  allow   - Add 0.0.0.0/0 for 6 hours')
  console.log('  remove  - Remove 0.0.0.0/0 immediately')
  process.exit(1)
}
