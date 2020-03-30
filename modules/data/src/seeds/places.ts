import { Place } from '../models/place'

import { LocaleTranslations, Types } from '@coronatab/shared'
import type { Polygon, MultiPolygon, Geometry } from 'geojson'
import { SeededCountries } from './places/countries/seeds'
import { SeededRegions } from './places/regions/seeds'
import { SeededCities } from './places/cities/seeds'
import { PlaceTypeId } from './places/types'
import * as fs from 'fs-extra'
import * as path from 'path'

export interface PlaceSeedData {
  id: string
  parentId: string
  locales: any
  alpha2code?: string
  alpha3code?: string
  population?: number
  coordinates?: [number, number],
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

export const SavePlaceSeedData = async ({ data, typeId }: { data: PlaceSeedData[], typeId: PlaceTypeId }) => {
  // Save all countries data to file
  const typePath = (() => {
    switch (typeId) {
      case 'country': return 'countries'
      case 'region': return 'regions'
      case 'city': return 'cities'
    }
  })()

  const dataVarName = (() => {
    switch (typeId) {
      case 'country': return 'CountriesData'
      case 'region': return 'RegionsData'
      case 'city': return 'CitiesData'
    }
  })()
  await fs.writeFile(path.resolve(__dirname, `./places/${typePath}/data.ts`), `
  import type { PlaceSeedData } from '../../places'

  export const ${dataVarName}: PlaceSeedData[] = ${
    JSON.stringify(data.map(p => Object.fromEntries(Object.entries(p).filter(([key, value]) => value !== undefined))), null, 2)
  }
  `)
}

export type PolygonMap = { [id: string]: Geometry }
export const SavePlacePolygons = async ({ polygons, typeId }: { polygons: PolygonMap, typeId: PlaceTypeId }) => {
  // Save all countries data to file
  const typePath = (() => {
    switch (typeId) {
      case 'country': return 'countries'
      case 'region': return 'regions'
      case 'city': return 'cities'
    }
  })()

  await fs.writeFile(path.resolve(__dirname, `./places/${typePath}/polygons.json`), `{
    ${Object.entries(polygons).filter(([ polygon ]) => !!polygon).map(([ id, polygon ]) => `"${id}": ${JSON.stringify(polygon)}`).join(',\n  ')}
  }`)
}

export const EarthPlace = new Place({
  id: 'earth',
  locales: {
    'af': 'Aarde',
    'sq': 'Tokë',
    'am': 'ምድር',
    'ar': 'أرض',
    'hy': 'Երկիր',
    'az': 'Yer',
    'eu': 'Lurra',
    'be': 'Зямля',
    'bn': 'পৃথিবী',
    'bs': 'Zemlja',
    'bg': 'Земя',
    'ca': 'Terra',
    'ceb': 'Yuta',
    'ny': 'Dziko lapansi',
    'zh': '地球',
    'zh-TW': '地球',
    'co': 'A Terra',
    'hr': 'Zemlja',
    'cs': 'Země',
    'da': 'Jorden',
    'nl': 'Aarde',
    'en': 'Earth',
    'eo': 'Tero',
    'et': 'Maa',
    'tl': 'Daigdig',
    'fi': 'Maa',
    'fr': 'Terre',
    'fy': 'Ierde',
    'gl': 'Terra',
    'ka': 'Დედამიწა',
    'de': 'Erde',
    'el': 'Γη',
    'gu': 'પૃથ્વી',
    'ht': 'Latè',
    'ha': 'Duniya',
    'haw': 'Honua',
    'iw': 'כדור הארץ',
    'hi': 'पृथ्वी',
    'hmn': 'Lub ntiaj teb',
    'hu': 'Föld',
    'is': 'Jörð',
    'ig': '.Wa',
    'id': 'Bumi',
    'ga': 'Domhan',
    'it': 'Terra',
    'ja': '地球',
    'jw': 'Bumi',
    'kn': 'ಭೂಮಿ',
    'kk': 'Жер',
    'km': 'ផែនដី',
    'rw': 'Isi',
    'ko': '지구',
    'ku': 'Erd',
    'ky': 'Жер',
    'lo': 'ແຜ່ນດິນໂລກ',
    'la': 'Terra',
    'lv': 'Zeme',
    'lt': 'Žemė',
    'lb': 'Äerd',
    'mk': 'Земјата',
    'mg': 'Tany',
    'ms': 'Bumi',
    'ml': 'ഭൂമി',
    'mt': 'Tad-Dinja',
    'mi': 'Rangi',
    'mr': 'पृथ्वी',
    'mn': 'Дэлхий',
    'my': 'ကမ္ဘာမြေ',
    'ne': 'पृथ्वी',
    'no': 'Jord',
    'or': 'ପୃଥିବୀ',
    'ps': 'ځمکه',
    'fa': 'زمین',
    'pl': 'Ziemia',
    'pt': 'Terra',
    'pa': 'ਧਰਤੀ',
    'ro': 'Pământ',
    'ru': 'Земля',
    'sm': 'Lalolagi',
    'gd': 'Talamh',
    'sr': 'Земља',
    'st': "Lefats'e",
    'sn': 'Pasi',
    'sd': 'ڌرتي',
    'si': 'පොළොවේ',
    'sk': 'Krajina',
    'sl': 'Zemljo',
    'so': 'Dhulka',
    'es': 'Tierra',
    'su': 'Bumi',
    'sw': 'Dunia',
    'sv': 'Earth',
    'tg': 'Замин',
    'ta': 'பூமி',
    'tt': '.Ир',
    'te': 'భూమి',
    'th': 'โลก',
    'tr': 'Dünya',
    'tk': 'Earther',
    'uk': 'Земля',
    'ur': 'زمین',
    'ug': 'Earth',
    'uz': 'Yer',
    'vi': 'Trái đất',
    'cy': 'Daear',
    'xh': 'Umhlaba',
    'yi': 'ערד',
    'yo': 'Ile aye',
    'zu': 'Umhlaba'
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
