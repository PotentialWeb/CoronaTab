import Cloudflare from 'cloudflare'
import { config as InjectEnvs } from 'dotenv'

InjectEnvs()

const cf = Cloudflare({
  token: process.env.CLOUDFLARE_TOKEN
})

;(async () => {
  await cf.zones.purgeCache(process.env.CLOUDFLARE_ZONE_ID, {
    files: ['https://coronatab.app', 'https://coronatab.app/dashboard']
  })
  console.log('🧹 Cloudflare cache successfully cleared')
})().catch(err => {
  console.error(err)
  process.exit(1)
})
