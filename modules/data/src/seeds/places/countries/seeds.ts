import { Place } from '../../../models/place'
import { PlacePolygon } from '../../../models/place/polygon'
import { Strings } from '@coronatab/shared'
import * as path from 'path'
import { CountriesData } from './data'

const SeededCountryPolygons: PlacePolygon[] = []
const SeededCountries: Place[] = []

CountriesData.map(country => {
  const id = Strings.dasherize(country.locales.en)

  const Country = new Place({
    id,
    locales: country.locales,
    alpha2code: country.alpha2code,
    alpha3code: country.alpha3code,
    typeId: 'country',
    parentId: 'earth',
    dataSource: country.dataSource
  })

  if (country.polygon) {
    const CountryPolygon = new PlacePolygon({
      placeId: id,
      polygon: country.polygon
    })
    SeededCountryPolygons.push(CountryPolygon)
  }

  SeededCountries.push(Country)
})

export { SeededCountryPolygons, SeededCountries }
