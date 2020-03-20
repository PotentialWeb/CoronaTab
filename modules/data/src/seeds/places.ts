import { Place } from '../models/place'

import type { LocaleTranslations } from '@coronatab/shared'
import type { Polygon, MultiPolygon } from 'geojson'

export interface PlaceSeedData {
  id: string
  parentId: string
  locales: LocaleTranslations
  phoneCode?: string
  alpha2code?: string
  alpha3code?: string
  population?: number
  coordinates?: [number, number],
  polygon?: Polygon | MultiPolygon
  alternativeNames?: string[]
  dataSource?: string
}

export const FindPlaceSeedDataInDataset = ({ dataset, term }: { dataset: PlaceSeedData[], term: string }) => {
  return dataset.find(p =>
    p.id === term
    || p.alpha3code === term
    || p.alpha2code === term
    || p.locales.en === term
    || p.alternativeNames?.includes(term)
  )
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
