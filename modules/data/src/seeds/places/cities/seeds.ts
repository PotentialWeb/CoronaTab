import { PlacePolygon } from '../../../models/place/polygon'
import { Place } from '../../../models/place'
import { Strings } from '@coronatab/shared'
import * as path from 'path'
import { CitiesData } from './data'

const SeededCityPolygons: PlacePolygon[] = []
const SeededCities: Place[] = []

CitiesData.map(city => {
  const id = Strings.dasherize(city.locales.en)

  const City = new Place({
    id,
    locales: city.locales,
    alpha2code: city.alpha2code,
    alpha3code: city.alpha3code,
    typeId: 'city',
    parentId: city.parentId
  })

  if (city.polygon) {
    const CityPolygon = new PlacePolygon({
      placeId: id,
      polygon: city.polygon
    })
    SeededCityPolygons.push(CityPolygon)
  }

  SeededCities.push(City)
})

export { SeededCityPolygons, SeededCities }
