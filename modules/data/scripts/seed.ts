import { PlaceType } from '../src/models/place/type'
import { PlaceTypes } from '../src/seeds/places/types'
import { Locale } from '../src/models/locale'
import { Place } from '../src/models/place'
import { connection, connect } from '../src'
import { Locales } from '../src/seeds/locales'
import { config as injectEnvs } from 'dotenv'
injectEnvs()

;(async () => {
  await connect()
  await Promise.all([
    Locale.save(Locales),
    PlaceType.save(PlaceTypes),
    Place
  ])
  console.log(`Seeded successfuly`)
  connection.close()
  process.exit(0)
})()
