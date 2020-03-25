import { JHUDataRow, JHU } from './jhu'
import { DataScraperRow } from './data-scraper'
import { CountriesData } from '../src/seeds/places/countries/data'
import { RegionsData } from '../src/seeds/places/regions/data'
import { CitiesData } from '../src/seeds/places/cities/data'
import { FindPlaceSeedDataInDataset, PlaceData, Place, EarthPlace } from '../src'
import * as fs from 'fs-extra'
import * as path from 'path'
export class Data {
  static async recalculate ({
    date,
    scraperData,
    jhuData
  }: {
    scraperData: DataScraperRow[]
    jhuData: JHUDataRow[],
    date: string
  }) {
    const countries = CountriesData
    const regions = RegionsData
    const cities = CitiesData

    const getIDsFromEntry = (entry: typeof scraperData[number]) => {
      let country = FindPlaceSeedDataInDataset({ dataset: countries, term: entry.country })

      if (!country) {
        country = FindPlaceSeedDataInDataset({
          dataset: regions,
          term: entry.country
        })
      }

      if (!country) {
        debugger
      }

      let id = country.id
      let parentId = country.parentId
      let jhuEntry = jhuData.find(r => r.countryId === country.id)

      if (country.id === 'united-states-of-america') {
        if (entry.state) {
          // US State
          const state = FindPlaceSeedDataInDataset({
            dataset: regions.filter(r => r.parentId === country.id),
            term: entry.state
          })
          id = state.id
          parentId = country.id
          jhuEntry = jhuData.find(r => r.countryId === country.id && r.region?.split(', ').pop() === state.alpha2code)

          if (entry.county) {
            // US County
            const county = FindPlaceSeedDataInDataset({
              dataset: regions.filter(r => r.parentId === state.id),
              term: entry.county
            })
            jhuEntry = jhuData.find(r => r.countryId === country.id && r.region?.includes(state.locales.en) && r.city?.includes(entry.county))
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

          jhuEntry = jhuData.find(r => r.countryId === country.id && r.region === region.locales.en)
          id = region.id
          parentId = country.id
        }
      }

      return { id, parentId, jhuEntry }
    }

    type PlaceSeedData = {
      [pladeId: string]: {
        data?: PlaceData
        place: Place
        aggregated?: {
          cases: number
          deaths: number
          recovered: number
        }
        parentId?: string
        jhuEntry?: typeof jhuData[number]
      }
    }

    const data: PlaceSeedData = {
      ...cities.reduce((results, city) => ({ ...results, [city.id]: { parentId: city.parentId, place: city } }), {}),
      ...regions.reduce((results, region) => ({ ...results, [region.id]: { parentId: region.parentId, place: region } }), {}),
      ...countries.reduce((results, country) => ({ ...results, [country.id]: { parentId: country.parentId, place: country } }), {}),
      earth: {
        data: new PlaceData({
          cases: 0,
          deaths: 0,
          recovered: 0,
          date,
          placeId: 'earth'
        }),
        place: EarthPlace
      }
    }

    for (const entry of scraperData) {
      const { id, parentId, jhuEntry } = getIDsFromEntry(entry)

      let cases = entry.cases ?? 0
      let deaths = entry.deaths ?? 0
      let recovered = entry.recovered ?? (entry.active && cases - entry.active) ?? 0

      if (jhuEntry) {
        const jhuValues = jhuEntry
        if (cases < jhuValues.cases) cases = jhuValues.cases
        if (deaths < jhuValues.deaths) deaths = jhuValues.deaths
        if (recovered < jhuValues.recovered) recovered = jhuValues.recovered
        data[id].jhuEntry = { ...jhuEntry }
      }
      data[id].data = new PlaceData({
        cases, deaths, recovered,
        placeId: id,
        date
      })
      data[id].parentId = parentId

      if (jhuEntry) {
        const index = jhuData.indexOf(jhuEntry)
        if (index > -1) {
          jhuData.splice(index, 1)
        }
      }
    }
    for (const entry of jhuData) {
      const place = JHU.getPlaceFromEntry({
        countryId: entry.countryId,
        region: entry.region
      })
      if (!place) {
        console.error(`No place found for JHU entry ${entry.countryId} ${entry.region}`)
        continue
      }
      const { id, parentId } = place

      let cases = entry.cases ?? 0
      let deaths = entry.deaths ?? 0
      let recovered = entry.recovered ?? 0

      data[id].data = new PlaceData({
        cases, deaths, recovered,
        placeId: id,
        date
      })
      data[id].parentId = parentId
    }

    let idsToReaggregate: string[] = [
      ...new Set(
        Object.values(data)
        .filter(({ parentId, place }) => parentId && place.typeId !== 'city' && !place.locales.en.includes('County'))
        .map(({ parentId }) => parentId)
        )
    ]

    const reaggregate = () => {
      const ids = idsToReaggregate
      idsToReaggregate = []
      for (const [id, placeData] of Object.entries(data).filter(([ id ]) => ids.includes(id))) {
        const children = Object.values(data).filter(({ parentId }) => parentId === id)
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

    const dataPath = path.resolve(__dirname, '../src/seeds/places/data.json')
    const result: PlaceData[] = require(dataPath)

    for (const { data: newData } of Object.values(data).filter(({ data }) => data)) {
      const existingEntry = result.find(r => r.placeId === newData.placeId && r.date === date)
      if (existingEntry) {
        if (existingEntry.cases < newData.cases) {
          existingEntry.cases = newData.cases
        }
        if (existingEntry.recovered < newData.recovered) {
          existingEntry.recovered = newData.recovered
        }
        if (existingEntry.deaths < newData.deaths) {
          existingEntry.deaths = newData.deaths
        }
      } else {
        result.push(newData)
      }
    }

    await fs.writeFile(dataPath, `
  [
    ${result
        .filter(data => data && (data.cases || data.deaths || data.recovered))
        .map(data => `{
      "placeId": "${data.placeId}",
      "date": "${data.date}",
      "cases": ${data.cases},
      "deaths": ${data.deaths},
      "recovered": ${data.recovered}
    }`).join(',\n  ')
    }
  ]
  `)

  }
}
