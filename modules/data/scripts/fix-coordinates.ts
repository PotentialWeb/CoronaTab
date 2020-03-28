import { connect, PlaceData, PlaceSeedData, FindPlaceSeedDataInDataset } from '../src'
import { config as InjectEnvs } from 'dotenv'
import { RegionsData } from '../src/seeds/places/regions/data'
import { CitiesData } from '../src/seeds/places/cities/data'
import { CountriesData } from '../src/seeds/places/countries/data'
import { Strings } from '@coronatab/shared'
import * as fs from 'fs-extra'
import * as path from 'path'
import { JHU } from './jhu'
import { DataScraper } from './data-scraper'

InjectEnvs()

;(async () => {

  const places = [
    ...CountriesData,
    ...RegionsData,
    ...CitiesData
  ]
  const fixedPlaces: PlaceSeedData[] = []

  for (const place of places) {
    if (place.coordinates?.[1] < -65) {
      place.coordinates = [place.coordinates[1], place.coordinates[0]]
      fixedPlaces.push(place)
    }
  }

  debugger

  // Save all countries data to file
  await fs.writeFile(path.resolve(__dirname, '../src/seeds/places/countries/data.ts'), `
import { PlaceSeedData } from '../../places'
const CountryPolygons = require('./polygons.json')

export const CountriesData: PlaceSeedData[] = [${CountriesData.map(({
  id,
  locales,
  phoneCode,
  alpha2code,
  alpha3code,
  population,
  coordinates,
  alternativeNames,
  dataSource,
  hospitalBedOccupancy,
  hospitalBeds,
  icuBeds
 }) => `{
  id: \`${id}\`,
  locales: {
    ${Object.entries(locales).map(([ locale, name ]) => `${locale}: \`${name}\``).join(',\n    ')}
  },
  phoneCode: ${phoneCode && `\`${phoneCode}\``},
  alpha2code: ${alpha2code && `\`${alpha2code}\``},
  alpha3code: ${alpha3code && `\`${alpha3code}\``},
  alternativeNames: ${alternativeNames && `[${alternativeNames.map(name => `\`${name}\``).join(', ')}]`},
  population: ${population},
  hospitalBedOccupancy: ${hospitalBedOccupancy},
  hospitalBeds: ${hospitalBeds},
  icuBeds: ${icuBeds},
  coordinates: ${JSON.stringify(coordinates)},
  polygon: CountryPolygons[\`${alpha3code}\`],
  parentId: 'earth',
  dataSource: ${dataSource && `\`${dataSource}\``}
}`).join(', ')}]
`)

  // Save all Region data to file
  await fs.writeFile(path.resolve(__dirname, '../src/seeds/places/regions/data.ts'), `
import { PlaceSeedData } from '../../places'
const RegionPolygons = require('./polygons.json')

export const RegionsData: PlaceSeedData[] = [${RegionsData.map(({
    id,
    locales,
    phoneCode,
    alpha2code,
    alpha3code,
    population,
    coordinates,
    parentId,
    alternativeNames,
    dataSource
   }) => `{
  id: \`${id}\`,
  locales: {
    ${Object.entries(locales).map(([ locale, name ]) => `${locale}: \`${name}\``).join(',\n    ')}
  },
  alternativeNames: ${alternativeNames && `[${alternativeNames.map(name => `\`${name}\``).join(', ')}]`},
  phoneCode: ${phoneCode && `\`${phoneCode}\``},
  alpha2code: ${alpha2code && `\`${alpha2code}\``},
  alpha3code: ${alpha3code && `\`${alpha3code}\``},
  population: ${population},
  coordinates: ${JSON.stringify(coordinates)},
  polygon: RegionPolygons[\`${id}\`],
  parentId: \`${parentId}\`,
  dataSource: ${dataSource && `\`${dataSource}\``}
}`).join(', ')}]
`)

  // Save all City data to file
  await fs.writeFile(path.resolve(__dirname, '../src/seeds/places/cities/data.ts'), `
import { PlaceSeedData } from '../../places'
const CityPolygons = require('./polygons.json')

export const CitiesData: PlaceSeedData[] = [${CitiesData.map(({
  id,
  locales,
  phoneCode,
  alpha2code,
  alpha3code,
  population,
  coordinates,
  parentId,
  alternativeNames,
  dataSource
}) => `{
  id: \`${id}\`,
  locales: {
    ${Object.entries(locales).map(([ locale, name ]) => `${locale}: \`${name}\``).join(',\n    ')}
  },
  phoneCode: ${phoneCode && `\`${phoneCode}\``},
  alpha2code: ${alpha2code && `\`${alpha2code}\``},
  alpha3code: ${alpha3code && `\`${alpha3code}\``},
  alternativeNames: ${alternativeNames && `[${alternativeNames.map(name => `\`${name}\``).join(', ')}]`},
  population: ${population},
  coordinates: ${JSON.stringify(coordinates)},
  polygon: CityPolygons[\`${id}\`],
  parentId: \`${parentId}\`,
  dataSource: ${dataSource && `\`${dataSource}\``}
}`).join(', ')}]
`)

  console.log('Success!')
  process.exit(0)
})().catch(err => {
  console.error(err)
  debugger
})
