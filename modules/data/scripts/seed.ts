import { connection, connect, Locale, PlaceType, Place, PlacePolygon } from '../src'
import { PlaceTypes } from '../src/seeds/places/types'
import { Locales } from '../src/seeds/locales'
import { config as injectEnvs } from 'dotenv'
import { SeededPlaces } from '../src/seeds/places'
import { SeededCountries, SeededCountryPolygons } from '../src/seeds/places/countries'
injectEnvs()

;(async () => {

  await connect()
  await Promise.all([
    Locale.save(Locales),
    PlaceType.save(PlaceTypes)
  ])

  await Place.save(SeededPlaces)
  await Place.save(SeededCountries)
  await PlacePolygon.save(SeededCountryPolygons)

  console.log(`Seeded successfuly`)
  connection.close()
  process.exit(0)
})().catch(err => {
  console.error(err)
  debugger
  process.exit(1)
})