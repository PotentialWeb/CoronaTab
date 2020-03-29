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
  alpha2code?: string
  alpha3code?: string
  population?: number
  coordinates?: [number, number],
  polygon?: Polygon | MultiPolygon
  alternativeNames?: string[]
  dataSource?: string
  hospitalBeds?: number
  hospitalBedOccupancy?: number
  icuBeds?: number
}

export const FindPlaceSeedDataInDataset = ({ dataset, term }: { dataset: PlaceSeedData[], term: string }) => {
  // tslint:disable-next-line:ter-no-irregular-whitespace
  term = term.replace(/ /g, ' ') // Replace weird spaces with normal spaces
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
  population: 7_800_000_000,
  typeId: 'planet'
})

export const SeededPlaces = [
  EarthPlace
]

export {
  SeededCountries,
  SeededRegions,
  SeededCities
}
