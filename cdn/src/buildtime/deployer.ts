import * as Cloudflare from 'cloudflare'
import * as fs from 'fs-extra'
import * as nanoid from 'nanoid'

interface DeployConfig {
  routes?: string[]
}

export const deploy = async (config: DeployConfig = {}) => {
  const { CLOUDFLARE_EMAIL, CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_KEY } = process.env
  if (!CLOUDFLARE_EMAIL) throw new Error(`Missing CLOUDFLARE_EMAIL environment variable`)
  if (!CLOUDFLARE_API_KEY) throw new Error(`Missing CLOUDFLARE_API_KEY environment variable`)
  if (!CLOUDFLARE_ZONE_ID) throw new Error(`Missing CLOUDFLARE_ZONE_ID environment variable`)

  const sourcePath = `./dist/worker.js`
  if (!fs.existsSync(sourcePath)) throw new Error(`Source (./dist/worker.js) does not exist. Did you forget to compile?`)
  const source = (await fs.readFile(sourcePath)).toString('utf-8')

  // Using API key and email because tokens are not yet supported for this
  const cf = Cloudflare({
    email: CLOUDFLARE_EMAIL,
    key: CLOUDFLARE_API_KEY
  })

  // Have to do a Raw API call because all wrappers are fucking broken

  // update Script
  const scriptId = nanoid()
  await cf.zoneWorkersScript.edit(CLOUDFLARE_ZONE_ID, `/** ${scriptId} */${source}`)

  // update Routes
  let { result: currentRoutes } = await cf.zoneWorkersRoutes.browse(CLOUDFLARE_ZONE_ID)
  const currentPatterns = currentRoutes.map(({ pattern }) => pattern)
  const patternsWeNeed = config.routes || [`*coronatab.app/*`]
  const patternsToDelete = currentPatterns.filter(pattern => !patternsWeNeed.includes(pattern))
  const patternsToAdd = patternsWeNeed.filter(pattern => !currentPatterns.includes(pattern))

  for (const pattern of patternsToDelete) {
    const route = currentRoutes.find(r => r.pattern === pattern)
    await cf.zoneWorkersRoutes.del(CLOUDFLARE_ZONE_ID, route.id)
  }

  for (const pattern of patternsToAdd) {
    await cf.zoneWorkersRoutes.add(CLOUDFLARE_ZONE_ID, { pattern, enabled: true })
  }
  console.log(`Worker script has been updated.`)
}
