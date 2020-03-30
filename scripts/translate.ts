import { config as InjectEnvs } from 'dotenv'
InjectEnvs()
import { v2 } from '@google-cloud/translate'
import { LocaleId, LocaleIds, Strings } from '../modules/shared'
import fs from 'fs-extra'
import path from 'path'
import type { PlaceSeedData } from '../modules/data/dist'
import { Async } from '../modules/shared/src/async'
const { Translate: GoogleTranslate } = v2
// Instantiates a client
const credentials = JSON.parse(process.env.GOOGLE_TRANSLATE_SERVICE_ACCOUNT)

const google = new GoogleTranslate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials
})

const translate = async (text: string, to: LocaleId) => {
  const [translation] = await google.translate(text, {
    from: 'en',
    to
  })
  return translation
}

;(async () => {
  // Countries
  const countriesPath = path.resolve(__dirname, '../modules/data/src/seeds/places/countries/data.ts')
  const { CountriesData: countries }: { CountriesData: PlaceSeedData[] } = require(countriesPath)

  let changedCountriesFile = false
  for (const country of countries) {
    // Add all missing locales
    const presentLocales = Object.keys(country.locales)
    const missingLocales = LocaleIds.filter(locale => !presentLocales.includes(locale))
    for (const locale of missingLocales) {
      const name = await translate(country.locales.en, locale)
      country.locales[locale] = Strings.capitalize(name)
      changedCountriesFile = true
    }
  }

  if (changedCountriesFile) {
    const newCountriesFile = `
import { PlaceSeedData } from '../../places'
const CountryPolygons = require('./polygons.json')
// tslint:disable
//@ts-ignore
export const CountriesData: PlaceSeedData[] = [${countries.map(({
  id,
  locales,
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
    ${Object.entries(locales).map(([ locale, name ]) => `'${locale}': \`${name}\``).join(',\n    ')}
  },
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
`
    debugger
    await fs.writeFile(countriesPath, newCountriesFile)
  }

  const regionsPath = path.resolve(__dirname, '../modules/data/src/seeds/places/regions/data.ts')
  const { RegionsData: regions }: { RegionsData: PlaceSeedData[] } = require(regionsPath)

  let changedRegionsFile = false
  for (const region of regions) {
    // Add all missing locales
    const presentLocales = Object.keys(region.locales)
    const missingLocales = LocaleIds.filter(locale => !presentLocales.includes(locale))
    if (missingLocales.length) {
      let success = false
      while (!success) {
        try {
          await Promise.all(missingLocales.map(async (locale) => {
            const name = await translate(region.locales.en, locale)
            region.locales[locale] = Strings.capitalize(name)
            changedRegionsFile = true
          }))
          success = true
        } catch (err) {
          console.error(err)
          console.error('Failed to translate, waiting for a minue')
          await Async.delay(1000 * 60)
        }
      }

      console.log(`${regions.indexOf(region)}/${regions.length}`)
    }
  }

  if (changedRegionsFile) {
  // Save all Region data to file
    const newRegionFile = `
import { PlaceSeedData } from '../../places'
const RegionPolygons = require('./polygons.json')
// tslint:disable
//@ts-ignore
export const RegionsData: PlaceSeedData[] = [${regions.map(({
    id,
    locales,
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
    ${Object.entries(locales).map(([ locale, name ]) => `'${locale}': \`${name}\``).join(',\n    ')}
  },
  alternativeNames: ${alternativeNames && `[${alternativeNames.map(name => `\`${name}\``).join(', ')}]`},
  alpha2code: ${alpha2code && `\`${alpha2code}\``},
  alpha3code: ${alpha3code && `\`${alpha3code}\``},
  population: ${population},
  coordinates: ${JSON.stringify(coordinates)},
  polygon: RegionPolygons[\`${id}\`],
  parentId: \`${parentId}\`,
  dataSource: ${dataSource && `\`${dataSource}\``}
}`).join(', ')}]
`
    debugger
    await fs.writeFile(regionsPath, newRegionFile)
  }

//   // Save all City data to file
//   await fs.writeFile(path.resolve(__dirname, '../src/seeds/places/cities/data.ts'), `
// import { PlaceSeedData } from '../../places'
// const CityPolygons = require('./polygons.json')

// export const CitiesData: PlaceSeedData[] = [${cities.map(({
//   id,
//   locales,
//   alpha2code,
//   alpha3code,
//   population,
//   coordinates,
//   parentId,
//   alternativeNames,
//   dataSource
// }) => `{
//   id: \`${id}\`,
//   locales: {
//     ${Object.entries(locales).map(([ locale, name ]) => `${locale}: \`${name}\``).join(',\n    ')}
//   },
//   alpha2code: ${alpha2code && `\`${alpha2code}\``},
//   alpha3code: ${alpha3code && `\`${alpha3code}\``},
//   alternativeNames: ${alternativeNames && `[${alternativeNames.map(name => `\`${name}\``).join(', ')}]`},
//   population: ${population},
//   coordinates: ${JSON.stringify(coordinates)},
//   polygon: CityPolygons[\`${id}\`],
//   parentId: \`${parentId}\`,
//   dataSource: ${dataSource && `\`${dataSource}\``}
// }`).join(', ')}]
// `)

  debugger
})()
