import { config as InjectEnvs } from 'dotenv'
import http from 'axios'

InjectEnvs()

;(async () => {

  await http.post(
    `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
    {
      purge_everything: true
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`
      }
    }
  )
  console.log('🧹 Cloudflare cache successfully cleared')
})().catch(err => {
  console.error(err)
  process.exit(1)
})
