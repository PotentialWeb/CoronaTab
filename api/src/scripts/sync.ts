import { connect, connection } from '../models'

import { config as injectEnvs } from 'dotenv'
injectEnvs()

;(async () => {
  console.log(`Synching models...`)
  await connect({
    synchronize: true
  })
  console.log(`Models have synched`)
  connection.close()
  process.exit(0)
})()
