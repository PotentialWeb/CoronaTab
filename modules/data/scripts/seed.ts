import { PlaceTypes } from '../src/seeds/places/types'
// Locale, PlaceType, Place, PlacePolygon
import { connection, connect } from '../src'
import { Locales } from '../src/seeds/locales'
import { config as injectEnvs } from 'dotenv'
import { SeededPlaces } from '../src/seeds/places'
import { SeededCountries, SeededCountryPolygons } from '../src/seeds/places/countries'
import { Locale } from '../src/models/locale'
import { PlaceType } from '../src/models/place/type'
import { Place } from '../src/models/place'
import { PlacePolygon } from '../src/models/place/polygon'
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
