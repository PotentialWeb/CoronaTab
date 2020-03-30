import { PlacePolygon } from '../../../models/place/polygon'
import { Place } from '../../../models/place'
import { Strings } from '@coronatab/shared'
import * as path from 'path'
import { CitiesData } from './data'
import { PolygonMap } from '../../places'

const SeededCityPolygons: PlacePolygon[] = []
const SeededCities: Place[] = []
const Polygons: PolygonMap = require('./polygons.json')
CitiesData.map(city => {

  const City = new Place({
    id: city.id,
    locales: city.locales,
    alpha2code: city.alpha2code,
    alpha3code: city.alpha3code,
    typeId: 'city',
    parentId: city.parentId,
    dataSource: city.dataSource
  })

  if (city.coordinates) {
    City.location = {
      type: 'Point',
      coordinates: city.coordinates
    }
  }

  if (Polygons[city.id]) {
    const polygon = Polygons[city.id]
    const CityPolygon = new PlacePolygon({
      placeId: city.id,
      polygon
    })
    SeededCityPolygons.push(CityPolygon)
  }

  SeededCities.push(City)
})

export { SeededCityPolygons, SeededCities }
