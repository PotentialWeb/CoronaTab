import { PlacePolygon } from '../../../models/place/polygon'
import { Place } from '../../../models/place'
import { Strings } from '@coronatab/shared'
import * as path from 'path'
import { PolygonMap, PlaceSeedData } from '../../places'

const SeededRegionPolygons: PlacePolygon[] = []
const SeededRegions: Place[] = []
const Polygons: PolygonMap = require('./polygons.json')
export const RegionsData: PlaceSeedData[] = require('./data.json')

RegionsData.map(region => {
  const id = Strings.dasherize(`${region.parentId} ${region.locales.en}`)

  const Region = new Place({
    id,
    locales: region.locales,
    alpha2code: region.alpha2code,
    alpha3code: region.alpha3code,
    typeId: 'region',
    parentId: region.parentId,
    dataSource: region.dataSource,
    alternativeNames: region.alternativeNames
  })

  if (region.coordinates) {
    Region.location = {
      type: 'Point',
      coordinates: region.coordinates
    }
  }
  if (Polygons[region.id]) {
    const RegionPolygon = new PlacePolygon({
      placeId: id,
      polygon: Polygons[region.id]
    })
    SeededRegionPolygons.push(RegionPolygon)
  }

  SeededRegions.push(Region)
})

export { SeededRegionPolygons, SeededRegions }
