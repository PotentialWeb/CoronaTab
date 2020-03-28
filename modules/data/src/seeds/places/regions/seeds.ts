import { PlacePolygon } from '../../../models/place/polygon'
import { Place } from '../../../models/place'
import { Strings } from '@coronatab/shared'
import * as path from 'path'
import { RegionsData } from './data'

const SeededRegionPolygons: PlacePolygon[] = []
const SeededRegions: Place[] = []

RegionsData.map(region => {
  const id = Strings.dasherize(`${region.parentId} ${region.locales.en}`)

  const Region = new Place({
    id,
    locales: region.locales,
    alpha2code: region.alpha2code,
    alpha3code: region.alpha3code,
    typeId: 'region',
    parentId: region.parentId,
    dataSource: region.dataSource
  })

  if (region.coordinates) {
    Region.location = {
      type: 'Point',
      coordinates: region.coordinates
    }
  }
  if (region.polygon) {
    const RegionPolygon = new PlacePolygon({
      placeId: id,
      polygon: region.polygon
    })
    SeededRegionPolygons.push(RegionPolygon)
  }

  SeededRegions.push(Region)
})

export { SeededRegionPolygons, SeededRegions }
