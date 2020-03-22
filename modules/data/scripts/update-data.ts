import { connect, FindPlaceSeedDataInDataset, PlaceData, PlaceSeedData } from '../src'
import { config as InjectEnvs } from 'dotenv'
import { RegionsData } from '../src/seeds/places/regions/data'
import { CitiesData } from '../src/seeds/places/cities/data'
import { CountriesData } from '../src/seeds/places/countries/data'
import moment from 'moment'
import { DATE_FORMAT } from '@coronatab/shared'
import fs from 'fs-extra'
import * as path from 'path'

InjectEnvs()

;(async () => {
  type Entry = {
    country: string
    state?: string
    county?: string
    cases: number
    active: number
    recovered?: number
    deaths?: number
  }
  const data: Entry[] = require('../coronadatascraper/dist/data.json')
  const date = (await fs.readFile(path.resolve(__dirname, '../coronadatascraper/dist/lastScrapeDate'))).toString()

  const countries = CountriesData
  const regions = RegionsData
  const cities = CitiesData

  const getIDsFromEntry = (entry: Entry) => {
    const country = FindPlaceSeedDataInDataset({ dataset: countries, term: entry.country })
    let id = country.id
    let parentId = 'earth'

    if (country.id === 'united-states-of-america') {
      if (entry.state) {
        // US State
        const state = FindPlaceSeedDataInDataset({
          dataset: regions.filter(r => r.parentId === country.id),
          term: entry.state
        })
        id = state.id
        parentId = country.id
        if (entry.county) {
          // US County
          const county = FindPlaceSeedDataInDataset({
            dataset: regions.filter(r => r.parentId === state.id),
            term: entry.county
          })
          id = county.id
          parentId = state.id
        }
      }
    } else {
      // Region
      const regionName = entry.county || entry.state
      if (regionName) {
        const region = FindPlaceSeedDataInDataset({
          dataset: regions.filter(r => r.parentId === country.id),
          term: regionName
        })
        id = region.id
        parentId = country.id
      }
    }

    return { id, parentId }
  }

  const getEntryFromId = (id: string) => {
    return data.find(entry => getIDsFromEntry(entry).id === id)
  }

  type PlaceSeedData = {
    [pladeId: string]: {
      data?: PlaceData
      aggregated?: {
        cases: number
        deaths: number
        recovered: number
      }
      parentId?: string
    }
  }

  const placeDatas: PlaceSeedData = {
    ...cities.reduce((results, city) => ({ ...results, [city.id]: { parentId: city.parentId } }), {}),
    ...regions.reduce((results, region) => ({ ...results, [region.id]: { parentId: region.parentId } }), {}),
    ...countries.reduce((results, country) => ({ ...results, [country.id]: { parentId: country.parentId } }), {}),
    earth: {
      data: new PlaceData({
        cases: 0,
        deaths: 0,
        recovered: 0,
        date,
        placeId: 'earth'
      })
    }
  }

  for (const entry of data) {
    const { id, parentId } = getIDsFromEntry(entry)
    placeDatas[id] = placeDatas[id] || {}
    const cases = entry.cases ?? 0
    const deaths = entry.deaths ?? 0
    const recovered = entry.recovered ?? (entry.active && cases - entry.active) ?? 0
    placeDatas[id].data = new PlaceData({
      cases, deaths, recovered,
      placeId: id,
      date
    })
    placeDatas[id].parentId = parentId
  }

  let idsToReaggregate: string[] = [ ...new Set(Object.values(placeDatas).map(({ parentId }) => parentId)) ]

  const reaggregate = () => {
    const ids = idsToReaggregate
    idsToReaggregate = []
    for (const [id, placeData] of Object.entries(placeDatas).filter(([ id ]) => ids.includes(id))) {
      const children = Object.values(placeDatas).filter(({ parentId }) => parentId === id)
      const aggregated = {
        cases: 0,
        deaths: 0,
        recovered: 0
      }
      for (const child of children.filter(c => c.data)) {
        aggregated.cases += child.data.cases
        aggregated.deaths += child.data.deaths
        aggregated.recovered += child.data.recovered
      }
      placeData.aggregated = aggregated
      const queueReaggregate = () => {
        if (placeData.parentId && !idsToReaggregate.includes(placeData.parentId)) {
          idsToReaggregate.push(placeData.parentId)
        }
      }

      if (!placeData.data) {
        placeData.data = new PlaceData({
          placeId: id,
          date,
          ...aggregated
        })
        queueReaggregate()
        continue
      }

      if (placeData.data.cases < aggregated.cases) {
        placeData.data.cases = aggregated.cases
        queueReaggregate()
      }
      if (placeData.data.recovered < aggregated.recovered) {
        placeData.data.recovered = aggregated.recovered
        queueReaggregate()
      }
      if (placeData.data.deaths < aggregated.deaths) {
        placeData.data.deaths = aggregated.deaths
        queueReaggregate()
      }
    }
  }

  reaggregate()

  while (idsToReaggregate.length) {
    reaggregate()
  }

  debugger

  // await connect()

  console.log('Success!')
  process.exit(0)
})().catch(err => {
  console.error(err)
  debugger
})
