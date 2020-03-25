import { Place } from '../models/place'

import type { LocaleTranslations } from '@coronatab/shared'
import type { Polygon, MultiPolygon } from 'geojson'
import { SeededCountries } from './places/countries/seeds'
import { SeededRegions } from './places/regions/seeds'
import { SeededCities } from './places/cities/seeds'

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
    || p.locales.en.toLowerCase() === term.toLowerCase()
    || p.alternativeNames?.map(n => n.toLowerCase()).includes(term.toLowerCase())
  )
}

export const EarthPlace = new Place({
  id: 'earth',
  locales: {
    en: 'Earth'
  },
  typeId: 'planet'
})

export const SeededPlaces = [
  EarthPlace
]
