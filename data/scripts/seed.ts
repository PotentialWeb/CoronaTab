import { PlaceType } from '../../modules/models/place/type'
import { PlaceTypes } from '../../modules/models/seeds/places/types'
import { Locale } from '../../modules/models/locale'
import { Locales } from '../../modules/models/seeds/locales'

import { config as injectEnvs } from 'dotenv'
import { connection, connect } from '../../modules/models'
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
