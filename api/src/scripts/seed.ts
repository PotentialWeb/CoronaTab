import { PlaceType } from '../models/place/type'
import { PlaceTypes } from '../seeds/places/types'
import { Locale } from '../models/locale'
import { Locales } from '../seeds/locales'

import { config as injectEnvs } from 'dotenv'
import { connection, connect } from '../models'
injectEnvs()

;(async () => {
  await connect()
  await Promise.all([
    Locale.save(Locales),
    PlaceType.save(PlaceTypes)
  ])
  console.log(`Seeded successfuly`)
  connection.close()
  process.exit(0)
})()
