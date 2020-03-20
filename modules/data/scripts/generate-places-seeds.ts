import { connect } from '../src'
import { config as InjectEnvs } from 'dotenv'
import { RegionsData } from '../src/seeds/places/regions/data'
import { CitiesData } from '../src/seeds/places/cities/data'
import { CountriesData } from '../src/seeds/places/countries/data'
import { Strings } from '@coronatab/shared'
import * as fs from 'fs-extra'
import * as path from 'path'

InjectEnvs()

;(async () => {
  const data: {
    country: string
    state?: string
    county?: string
    coordinates?: [number, number]
    featureId?: number
    cases: number
    active: number
    recovered?: number
    deaths?: number
    population?: number
  }[] = require('../coronadatascraper/dist/data.json')
  const { features } = require('../coronadatascraper/dist/features.json')
  const USStatesCodeMap = require('./us-states-code-map.json')

  await connect()

  const countries = CountriesData
  const regions = RegionsData
  const cities = CitiesData

  for (const entry of data) {
    let country = countries.find(c => c.alpha3code === entry.country || c.locales.en === entry.country)

    if (!country) {
      // If no country found then try to search for regions in case some of it is Dependency of another country
      country = regions.find(r => r.alpha3code === entry.country) as any
    }

    if (!country) throw new Error(`No country for entry: ${JSON.stringify(entry)}`)

    country.coordinates = country.coordinates ?? entry.coordinates

    if (country.alpha3code === 'GBR') {
      if (entry.state) {
        // UK Region
        const id = `${country.id}-${Strings.dasherize(entry.state)}`
        let region = regions.find(r => r.id === id)

        if (!region) {
          region = {
            id,
            parentId: country.id,
            locales: {
              en: entry.state
            } as any
          }
          regions.push(region)
        }
        region.coordinates = region.coordinates ?? entry.coordinates
        region.population = region.population ?? entry.population
        if (!region.polygon && entry.featureId) {
          const feature = features.find(f => f.properties?.id === entry.featureId)
          region.polygon = feature?.geometry
        }

      } else if (entry.county) {
        // UK City
        const id = `${country.id}-${Strings.dasherize(entry.county)}`
        let city = cities.find(c => c.id === id)

        if (!city) {
          city = {
            id,
            parentId: country.id,
            locales: {
              en: entry.county
            } as any
          }
          cities.push(city)
        }
        city.coordinates = city.coordinates ?? entry.coordinates
        city.population = city.population ?? entry.population
        if (!city.polygon && entry.featureId) {
          const feature = features.find(f => f.properties?.id === entry.featureId)
          city.polygon = feature?.geometry
        }
      }
    } else if (country.alpha3code === 'USA') {
      // US State
      const stateName = USStatesCodeMap[entry.state]
      if (!stateName) throw new Error(`No US State name for code: ${entry.state}`)
      const stateId = `${country.id}-${Strings.dasherize(stateName)}`
      let state = regions.find(r => r.id === stateId)

      if (!state) {
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
        const feature = features.find(f => f.properties?.id === entry.featureId)
        state.polygon = feature?.geometry
      }
      // County
      if (entry.county) {
        const countyId = `${state.id}-${Strings.dasherize(entry.county)}`
        let county = regions.find(r => r.parentId === state.id && r.id === countyId)

        if (!county) {
          county = {
            id: countyId,
            locales: {
              en: entry.county
            },
            parentId: stateId
          }
          regions.push(county)
        }
        county.coordinates = county.coordinates ?? entry.coordinates
        county.population = county.population ?? entry.population
        if (!county.polygon && entry.featureId) {
          const feature = features.find(f => f.properties?.id === entry.featureId)
          county.polygon = feature?.geometry
        }
      }
    } else {
      const regionName = entry.county || entry.state
      if (regionName) {
        // Country Region
        const id = `${country.id}-${Strings.dasherize(regionName)}`
        let region = regions.find(r => r.id === id)

        if (!region) {
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
          const feature = features.find(f => f.properties?.id === entry.featureId)
          region.polygon = feature?.geometry
        }
      }

    }
  }

  // Save all countries data to file
  await fs.writeFile(path.resolve(__dirname, '../src/seeds/places/countries/data.ts'), `
import { PlaceSeedData } from '../../places'
const CountryPolygons = require('./polygons.json')

export const CountriesData: PlaceSeedData[] = [
  ${countries.map(({ id, locales, phoneCode, alpha2code, alpha3code, population, coordinates }) => `{
    id: \`${id}\`,
    locales: {
      ${Object.entries(locales).map(([ locale, name ]) => `${locale}: \`${name}\``).join(',\n    ')}
    },
    phoneCode: ${phoneCode && `\`${phoneCode}\``},
    alpha2code: ${alpha2code && `\`${alpha2code}\``},
    alpha3code: ${alpha3code && `\`${alpha3code}\``},
    population: ${population},
    coordinates: ${JSON.stringify(coordinates)},
    polygon: CountryPolygons[\`${alpha3code}\`]
  }`).join(',\n  ')}
]
`)

  // Save all Region Geometries to polygons.json file
  await fs.writeFile(path.resolve(__dirname, '../src/seeds/places/regions/polygons.json'), `{
  ${regions.filter(({ polygon }) => !!polygon).map(({ id, polygon }) => `"${id}": ${JSON.stringify(polygon)}`).join(',\n  ')}
}`)

  // Save all Region data to file
  await fs.writeFile(path.resolve(__dirname, '../src/seeds/places/regions/data.ts'), `
import { PlaceSeedData } from '../../places'
const RegionPolygons = require('./polygons.json')

export const RegionsData: PlaceSeedData[] = [
  ${regions.map(({ id, locales, phoneCode, alpha2code, alpha3code, population, coordinates }) => `{
    id: \`${id}\`,
    locales: {
      ${Object.entries(locales).map(([ locale, name ]) => `${locale}: \`${name}\``).join(',\n    ')}
    },
    phoneCode: ${phoneCode && `\`${phoneCode}\``},
    alpha2code: ${alpha2code && `\`${alpha2code}\``},
    alpha3code: ${alpha3code && `\`${alpha3code}\``},
    population: ${population},
    coordinates: ${JSON.stringify(coordinates)},
    polygon: RegionPolygons[\`${id}\`]
  }`).join(',\n  ')}
]
`)

  // Save all City Geometries to polygons.json file
  await fs.writeFile(path.resolve(__dirname, '../src/seeds/places/cities/polygons.json'), `{
  ${cities.filter(({ polygon }) => !!polygon).map(({ id, polygon }) => `"${id}": ${JSON.stringify(polygon)}`).join(',\n  ')}
}`)

  // Save all City data to file
  await fs.writeFile(path.resolve(__dirname, '../src/seeds/places/cities/data.ts'), `
import { PlaceSeedData } from '../../places'
const CityPolygons = require('./polygons.json')

export const CitiesData: PlaceSeedData[] = [
  ${cities.map(({ id, locales, phoneCode, alpha2code, alpha3code, population, coordinates }) => `{
    id: \`${id}\`,
    locales: {
      ${Object.entries(locales).map(([ locale, name ]) => `${locale}: \`${name}\``).join(',\n    ')}
    },
    phoneCode: ${phoneCode && `\`${phoneCode}\``},
    alpha2code: ${alpha2code && `\`${alpha2code}\``},
    alpha3code: ${alpha3code && `\`${alpha3code}\``},
    population: ${population},
    coordinates: ${JSON.stringify(coordinates)},
    polygon: CityPolygons[\`${id}\`]
  }`).join(',\n  ')}
]
`)

  console.log('Success!')
  process.exit(0)
})().catch(err => {
  console.error(err)
  debugger
})
