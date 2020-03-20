import { Place } from '../models/place'

import type { LocaleTranslations } from '@coronatab/shared'
import type { Polygon, MultiPolygon } from 'geojson'

export interface PlaceSeedData {
  id: string
  locales: LocaleTranslations
  phoneCode?: string
  alpha2code?: string
  alpha3code?: string
  population?: number
  coordinates?: [number, number],
  polygon?: Polygon | MultiPolygon
  parentId?: string
}

export const SeededPlaces = [
  new Place({
    id: 'earth',
    locales: {
      en: 'Earth'
    },
    typeId: 'planet'
  })
]
