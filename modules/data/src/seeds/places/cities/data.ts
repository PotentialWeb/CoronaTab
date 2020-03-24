
import { PlaceSeedData } from '../../places'
const CityPolygons = require('./polygons.json')

export const CityIds = [
  
] as const
export type CityId = typeof CityIds[number]

export const CitiesData: PlaceSeedData[] = []
