import { connection, connect, Locale, PlaceType, Place, PlacePolygon, PlaceData } from '../src'
import { PlaceTypes } from '../src/seeds/places/types'
import { Locales } from '../src/seeds/locales'
import { config as injectEnvs } from 'dotenv'
import { SeededPlaces } from '../src/seeds/places'
import { SeededCountries, SeededCountryPolygons } from '../src/seeds/places/countries/seeds'
import { SeededRegions, SeededRegionPolygons } from '../src/seeds/places/regions/seeds'
import { SeededCities, SeededCityPolygons } from '../src/seeds/places/cities/seeds'
import { SeededPlaceDatas } from '../src/seeds/places/data'
import moment from 'moment'
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

  await Place.save(SeededRegions)
  await PlacePolygon.save(SeededRegionPolygons)

  await Place.save(SeededCities)
  await PlacePolygon.save(SeededCityPolygons)

  await PlaceData.save(SeededPlaceDatas
    // .filter(d => d.date === '2020-03-29')
  , { chunk: 10_000 })

  console.log(`Seeded successfuly`)
  connection.close()
  process.exit(0)
})().catch(err => {
  console.error(err)
  debugger
  process.exit(1)
})
