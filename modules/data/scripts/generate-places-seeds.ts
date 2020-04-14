import { connect, PlaceData, PlaceSeedData, FindPlaceSeedDataInDataset, SavePlaceSeedData, PolygonMap, SavePlacePolygons } from '../src'
import { config as InjectEnvs } from 'dotenv'
InjectEnvs()
import { RegionsData } from '../src/seeds/places/regions/seeds'
import { CitiesData } from '../src/seeds/places/cities/seeds'
import { CountriesData } from '../src/seeds/places/countries/seeds'
import { Strings } from '@coronatab/shared'
import * as fs from 'fs-extra'
import * as path from 'path'
import { JHU } from './jhu'
import { DataScraper } from './data-scraper'
import { Translate } from '@coronatab/node-utils'

;(async () => {

  const { features } = require('../coronadatascraper/dist/features.json')
  const USStatesCodeMap = require('./us-states-code-map.json')
  const FIPSMap: {
    fips: number
    city?: string
    region?: string
    country: string
  }[] = require('./fips-map.json')

  const data = DataScraper.latest
  const jhuData = await JHU.getLatestData()

  const countries = CountriesData
  let regions = RegionsData
  let cities = CitiesData
  const regionPolygons: PolygonMap = require('../src/seeds/places/regions/polygons.json')
  const cityPolygons: PolygonMap = require('../src/seeds/places/regions/polygons.json')

  const newRegions: PlaceSeedData[] = []
  const newCities: PlaceSeedData[] = []

  for (const entry of data) {
    entry.country = entry.country.replace(/iso\d+:/g, '')
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
      debugger
      continue
    }
    let jhuEntry = jhuData.find(r => r.countryId === country.id || r.region === country.locales.en)

    if (!jhuEntry && !entry.state && !entry.county) {
      console.log(entry)
      debugger
    }

    if (!country) {
      console.error(`No country for entry: ${JSON.stringify(entry)}`)
      debugger
      process.exit(1)
    }

    const updateCoordinates = (entity: PlaceSeedData) => {
      const coordinates = entry.coordinates ?? (jhuEntry && [jhuEntry.lng, jhuEntry.lat])
      if (coordinates && JSON.stringify(entity.coordinates) !== JSON.stringify(coordinates)) {
        entity.coordinates = coordinates
      }
      if (entry.coordinates?.[1] < -65) {
        entity.coordinates = [entity.coordinates[1], entry.coordinates[0]]
      }
    }

    updateCoordinates(country)
    if (entry.url && country.dataSource !== entry.url) {
      country.dataSource = entry.url
    }

    if (country.alpha3code === 'USA') {
      if (entry.state) {

      // US State
        const stateName = USStatesCodeMap[entry.state] ?? entry.state.replace(/iso\d+:US-/g, '')

        let state = FindPlaceSeedDataInDataset({
          dataset: regions.filter(r => r.parentId === country.id),
          term: stateName
        })

        if (!state) {
          const stateId = `${country.id}-${Strings.dasherize(stateName)}`
          state = {
            id: stateId,
            parentId: country.id,
            alpha2code: entry.state,
            locales: {
              en: stateName
            } as any
          }
          if (!regions.find(r => r.id === stateId)) {
            debugger
            regions.push(state)
            newRegions.push(state)
          }
        }
        jhuEntry = jhuData.find(r => r.countryId === country.id && r.region === state.locales.en)

        updateCoordinates(state)

        state.population = state.population ?? entry.population
        if (!regionPolygons[state.id] && entry.featureId) {
          const feature = features.find(f => f.properties?.id === entry.featureId)
          regionPolygons[state.id] = feature?.geometry
        }
        if (entry.url && state.dataSource !== entry.url) {
          state.dataSource = entry.url
        }
        // County
        if (entry.county && entry.county !== state.locales.en) {
          let countyName = entry.county
          if (countyName.includes('fips')) {
            const fipsCode = parseInt(countyName.replace('fips:', ''))
            const fipsEntry = FIPSMap.find(e => e.fips === fipsCode)
            if (!fipsEntry) debugger
            countyName = fipsEntry.region
          }
          let county = FindPlaceSeedDataInDataset({
            dataset: regions.filter(r => r.parentId === state.id),
            term: countyName
          })

          if (!county) {
            const countyId = `${state.id}-${Strings.dasherize(countyName)}`
            county = {
              id: countyId,
              locales: {
                en: countyName
              } as any,
              parentId: state.id
            }
            if (!regions.find(r => r.id === countyId)) {
              regions.push(county)
              newRegions.push(county)
            }
          }
          jhuEntry = jhuData.find(r => r.countryId === country.id && r.region === state.locales.en && r.region === county.locales.en)

          updateCoordinates(county)
          county.population = county.population ?? entry.population
          if (!regionPolygons[county.id] && entry.featureId) {
            const feature = features.find(f => f.properties?.id === entry.featureId)
            regionPolygons[county.id] = feature?.geometry
          }
          if (entry.url && county.dataSource !== entry.url) {
            county.dataSource = entry.url
          }

          // City
          if (entry.city && entry.city !== county.locales.en) {
            let cityName = entry.city
            if (cityName.includes('fips')) {
              const fipsCode = parseInt(cityName.replace('fips:', ''))
              const fipsEntry = FIPSMap.find(e => e.fips === fipsCode)
              if (!fipsEntry) debugger
              cityName = fipsEntry.city
            }
            let city = FindPlaceSeedDataInDataset({
              dataset: cities.filter(c => c.parentId === county.id),
              term: cityName
            })

            if (!city) {
              const cityId = `${county.id}-${Strings.dasherize(cityName)}`
              city = {
                id: cityId,
                locales: {
                  en: cityName
                } as any,
                parentId: county.id
              }
              if (!cities.find(c => c.id === cityId)) {
                cities.push(city)
                newCities.push(city)
              }
            }
            jhuEntry = jhuData.find(r => r.countryId === country.id && r.region === state.locales.en && r.region === county.locales.en && r.city === city.locales.en)

            updateCoordinates(city)
            city.population = city.population ?? entry.population
            if (!cityPolygons[city.id] && entry.featureId) {
              const feature = features.find(f => f.properties?.id === entry.featureId)
              cityPolygons[city.id] = feature?.geometry
            }
            if (entry.url && city.dataSource !== entry.url) {
              city.dataSource = entry.url
            }
          }
        }
      }
    } else {
      let regionName = entry.county || entry.state
      if (regionName) {
        // Country Region
        let region = FindPlaceSeedDataInDataset({
          dataset: regions.filter(r => r.parentId === country.id),
          term: regionName
        })

        if (!region) {
          if (country.id === 'russia' && !regionName.includes('a')) {
            // translate russian region
            regionName = await Translate.text({ from: 'ru', to: 'en', text: regionName })
          }
          const id = `${country.id}-${Strings.dasherize(regionName)}`
          region = {
            id,
            parentId: country.id,
            locales: {
              en: regionName
            } as any
          }
          if (!regions.find(r => r.id === id)) {
            regions.push(region)
            newRegions.push(region)
          }
        }
        jhuEntry = jhuData.find(r => r.countryId === country.id && r.region === region.locales.en)

        updateCoordinates(region)

        region.population = region.population ?? entry.population
        if (!regionPolygons[region.id] && entry.featureId) {
          const feature = features.find(f => f.properties?.id === entry.featureId)
          regionPolygons[region.id] = feature?.geometry
        }
        if (entry.url && region.dataSource !== entry.url) {
          region.dataSource = entry.url
        }

        // City
        if (entry.city && entry.city !== region.locales.en) {
          let city = FindPlaceSeedDataInDataset({
            dataset: cities.filter(c => c.parentId === region.id),
            term: entry.city
          })

          if (!city) {
            const cityId = `${region.id}-${Strings.dasherize(entry.city)}`
            city = {
              id: cityId,
              locales: {
                en: entry.city
              } as any,
              parentId: region.id
            }
            if (!cities.find(c => c.id === cityId)) {
              debugger
              cities.push(city)
              newCities.push(city)
            }
          }
          jhuEntry = jhuData.find(r => r.countryId === country.id && r.region === region.locales.en && r.city === city.locales.en)

          updateCoordinates(city)
          city.population = city.population ?? entry.population
          if (!cityPolygons[city.id] && entry.featureId) {
            const feature = features.find(f => f.properties?.id === entry.featureId)
            cityPolygons[city.id] = feature?.geometry
          }
          if (entry.url && city.dataSource !== entry.url) {
            city.dataSource = entry.url
          }
        }
      }

    }
    if (jhuEntry) {
      jhuData.splice(jhuData.indexOf(jhuEntry), 1)
    }
  }

  // Save JHU places that werent part of the original data
  for (const entry of jhuData.filter(e => e.region)) {
    // Region
    const regionId = `${entry.countryId}-${Strings.dasherize(entry.region)}`
    const region: PlaceSeedData = {
      id: regionId,
      parentId: entry.countryId,
      locales: {
        en: entry.region
      } as any,
      coordinates: [entry.lat, entry.lng]
    }
    if (!regions.find(r => r.id === regionId)) {
      regions.push(region)
      newRegions.push(region)
    }
    if (entry.city) {
      // City
      const cityId = `${region.id}-${Strings.dasherize(entry.city)}`

      const city: PlaceSeedData = {
        id: cityId,
        parentId: regionId,
        locales: {
          en: entry.city
        } as any,
        coordinates: [entry.lat, entry.lng]
      }
      if (!cities.find(c => c.id === cityId)) {
        cities.push(city)
        newCities.push(city)
      }

    }
  }

  debugger

  regions = regions.filter(r => ![
    'united-kingdom-uk'
  ].includes(r.id))

  // Save all countries data to file
  await SavePlaceSeedData({
    typeId: 'country',
    data: countries
  })
  // Save all Region Geometries to polygons.json file
  await SavePlacePolygons({
    polygons: regionPolygons,
    typeId: 'region'
  })
  await SavePlaceSeedData({
    typeId: 'region',
    data: regions
  })

  // Save all City Geometries to polygons.json file
  await SavePlacePolygons({
    polygons: cityPolygons,
    typeId: 'city'
  })

  // Save all City data to file
  await SavePlaceSeedData({
    typeId: 'city',
    data: cities
  })

  console.log('Success!')
  process.exit(0)
})().catch(err => {
  console.error(err)
  debugger
})
