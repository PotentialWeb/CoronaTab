import { connect, FindPlaceSeedDataInDataset } from '../src'
import { config as InjectEnvs } from 'dotenv'
import { RegionsData } from '../src/seeds/places/regions/data'
import { CitiesData } from '../src/seeds/places/cities/data'
import { CountriesData } from '../src/seeds/places/countries/data'

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

  const countries = CountriesData
  const regions = RegionsData
  const cities = CitiesData

  const getIDFromEntry = (entry: Entry) => {
    const country = FindPlaceSeedDataInDataset({ dataset: countries, term: entry.country })
    let id = country.id

    if (country.id === 'united-kingdom') {
      if (entry.state) {
        // UK Region
        const region = FindPlaceSeedDataInDataset({ dataset: regions, term: entry.state })
        id = region.id
      } else if (entry.county) {
        // UK City
        const city = FindPlaceSeedDataInDataset({ dataset: cities, term: entry.county })
        id = city.id
      }
    } else if (country.id === 'united-states-of-america') {
      if (entry.state) {
        // US State
        const state = FindPlaceSeedDataInDataset({ dataset: regions, term: entry.state })
        id = state.id

        if (entry.county) {
          // US County
          const county = FindPlaceSeedDataInDataset({ dataset: regions, term: entry.county })
          id = county.id
        }
      }
    } else {
      // Region
      const regionName = entry.county || entry.state
      if (regionName) {
        const region = FindPlaceSeedDataInDataset({ dataset: regions, term: regionName })
        id = region.id
      }
    }

    return id
  }

  for (const entry of data) {
    const id = getIDFromEntry(entry)
    console.log(entry.country, entry.state, entry.county, id)
  }

  // await connect()

  console.log('Success!')
  process.exit(0)
})().catch(err => {
  console.error(err)
  debugger
})
