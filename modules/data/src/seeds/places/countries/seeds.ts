import { Place } from '../../../models/place'
import { PlacePolygon } from '../../../models/place/polygon'
import { Strings } from '@coronatab/shared'
import * as path from 'path'
import { CountriesData } from './data'
import { PolygonMap } from '../../places'

const SeededCountryPolygons: PlacePolygon[] = []
const SeededCountries: Place[] = []
const Polygons: PolygonMap = require('./polygons.json')
CountriesData.map(country => {
  const Country = new Place({
    id: country.id,
    locales: country.locales,
    alpha2code: country.alpha2code,
    alpha3code: country.alpha3code,
    population: country.population,
    hospitalBedOccupancy: country.hospitalBedOccupancy,
    hospitalBeds: country.hospitalBeds,
    icuBeds: country.icuBeds,
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

  if (Polygons[country.id]) {
    const CountryPolygon = new PlacePolygon({
      placeId: Country.id,
      polygon: Polygons[country.id]
    })
    SeededCountryPolygons.push(CountryPolygon)
  }

  SeededCountries.push(Country)
})

export { SeededCountryPolygons, SeededCountries }
