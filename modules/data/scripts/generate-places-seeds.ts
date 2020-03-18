import { Place, connect } from '../src'
import { config as InjectEnvs } from 'dotenv'
InjectEnvs()

;(async () => {
  const data = require('../coronadatascraper/dist/data.json')
  const { features } = require('../coronadatascraper/dist/features.json')

  await connect()

  const places: Place[] = []
  for (const entry of data) {
    //
  }
})().catch(err => {
  console.error(err)
  debugger
})
