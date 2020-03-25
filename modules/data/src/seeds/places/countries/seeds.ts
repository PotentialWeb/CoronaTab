import { Place } from '../../../models/place'
import { PlacePolygon } from '../../../models/place/polygon'
import { Strings } from '@coronatab/shared'
import * as path from 'path'
import { CountriesData } from './data'

const SeededCountryPolygons: PlacePolygon[] = []
const SeededCountries: Place[] = []

CountriesData.map(country => {
  const Country = new Place({
    id: country.id,
    locales: country.locales,
    alpha2code: country.alpha2code,
    alpha3code: country.alpha3code,
    population: country.population,
    typeId: 'country',
    parentId: 'earth',
    dataSource: country.dataSource
  })

  if (country.coordinates) {
    Country.location = {
      type: 'Point',
      coordinates: country.coordinates
    }
  }

  if (country.polygon) {
    const CountryPolygon = new PlacePolygon({
      placeId: Country.id,
      polygon: country.polygon
    })
    SeededCountryPolygons.push(CountryPolygon)
  }

  SeededCountries.push(Country)
})

export { SeededCountryPolygons, SeededCountries }
