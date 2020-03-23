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

  const { features: lazdFeatures } = require('../coronadatascraper/dist/features.json')
  const USStatesCodeMap = require('./us-states-code-map.json')

  const data = DataScraper.data

  const countries = CountriesData
  const regions = RegionsData
  const cities = CitiesData

  for (const entry of data) {
    let country = FindPlaceSeedDataInDataset({
      dataset: countries,
      term: entry.country
    })

    if (!country) {
      country = FindPlaceSeedDataInDataset({
        dataset: regions,
        term: entry.country
      })
    }

    if (!country) {
      console.error(`No country for entry: ${JSON.stringify(entry)}`)
      debugger
      process.exit(1)
    }

    country.coordinates = country.coordinates ?? entry.coordinates
    if (entry.url && country.dataSource !== entry.url) {
      country.dataSource = entry.url
    }

    if (country.alpha3code === 'USA') {
      if (entry.state) {

      // US State
        const stateName = USStatesCodeMap[entry.state]
        if (!stateName) {
          console.error(`No US State name for code: ${entry.state}`)
          debugger
          process.exit(1)
        }

        let state = FindPlaceSeedDataInDataset({
          dataset: regions.filter(r => r.parentId === country.id),
          term: stateName
        })

        if (!state) {
          const stateSubId = Strings.dasherize(stateName)
          const stateId = `${country.id}-${stateSubId}`
          state = {
            id: stateId,
            parentId: country.id,
            alpha2code: entry.state,
            locales: {
              en: stateName
            } as any
          }
          regions.push(state)
        }

        state.coordinates = state.coordinates ?? entry.coordinates
        state.population = state.population ?? entry.population
        if (!state.polygon && entry.featureId) {
          const feature = lazdFeatures.find(f => f.properties?.id === entry.featureId)
          state.polygon = feature?.geometry
        }
        if (entry.url && state.dataSource !== entry.url) {
          state.dataSource = entry.url
        }
      // County
        if (entry.county) {
          let county = FindPlaceSeedDataInDataset({
            dataset: regions.filter(r => r.parentId === state.id),
            term: entry.county
          })

          if (!county) {
            const countyId = `${state.id}-${Strings.dasherize(entry.county)}`
            county = {
              id: countyId,
              locales: {
                en: entry.county
              },
              parentId: state.id
            }
            regions.push(county)
          }
          county.coordinates = county.coordinates ?? entry.coordinates
          county.population = county.population ?? entry.population
          if (!county.polygon && entry.featureId) {
            const feature = lazdFeatures.find(f => f.properties?.id === entry.featureId)
            county.polygon = feature?.geometry
          }
          if (entry.url && county.dataSource !== entry.url) {
            county.dataSource = entry.url
          }
        }
      }
    } else {
      const regionName = entry.county || entry.state
      if (regionName) {
        // Country Region
        let region = FindPlaceSeedDataInDataset({
          dataset: regions.filter(r => r.parentId === country.id),
          term: regionName
        })

        if (!region) {
          const id = `${country.id}-${Strings.dasherize(regionName)}`
          region = {
            id,
            parentId: country.id,
            locales: {
              en: regionName
            } as any
          }
          regions.push(region)
        }
        region.coordinates = region.coordinates ?? entry.coordinates
        region.population = region.population ?? entry.population
        if (!region.polygon && entry.featureId) {
          const feature = lazdFeatures.find(f => f.properties?.id === entry.featureId)
          region.polygon = feature?.geometry
        }
        if (entry.url && region.dataSource !== entry.url) {
          region.dataSource = entry.url
        }
      }

    }
  }

  // Save all countries data to file
  await fs.writeFile(path.resolve(__dirname, '../src/seeds/places/countries/data.ts'), `
import { PlaceSeedData } from '../../places'
const CountryPolygons = require('./polygons.json')

export const CountriesData: PlaceSeedData[] = [${countries.map(({
  id,
  locales,
  phoneCode,
  alpha2code,
  alpha3code,
  population,
  coordinates,
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
  polygon: CountryPolygons[\`${alpha3code}\`],
  parentId: 'earth',
  dataSource: ${dataSource && `\`${dataSource}\``}
}`).join(', ')}]
`)

  // Save all Region Geometries to polygons.json file
  await fs.writeFile(path.resolve(__dirname, '../src/seeds/places/regions/polygons.json'), `{
  ${regions.filter(({ polygon }) => !!polygon).map(({ id, polygon }) => `"${id}": ${JSON.stringify(polygon)}`).join(',\n  ')}
}`)

  // Save all Region data to file
  await fs.writeFile(path.resolve(__dirname, '../src/seeds/places/regions/data.ts'), `
import { PlaceSeedData } from '../../places'
const RegionPolygons = require('./polygons.json')

export const RegionsData: PlaceSeedData[] = [${regions.map(({
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

  // Save all City Geometries to polygons.json file
  await fs.writeFile(path.resolve(__dirname, '../src/seeds/places/cities/polygons.json'), `{
  ${cities.filter(({ polygon }) => !!polygon).map(({ id, polygon }) => `"${id}": ${JSON.stringify(polygon)}`).join(',\n  ')}
}`)

  // Save all City data to file
  await fs.writeFile(path.resolve(__dirname, '../src/seeds/places/cities/data.ts'), `
import { PlaceSeedData } from '../../places'
const CityPolygons = require('./polygons.json')

export const CitiesData: PlaceSeedData[] = [${cities.map(({
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
