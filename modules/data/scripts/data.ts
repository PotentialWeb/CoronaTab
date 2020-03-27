import { FindPlaceSeedDataInDataset, PlaceData, Place, EarthPlace, connect } from '../src'
import { JHUDataRow, JHU } from './jhu'
import { DataScraperRow } from './data-scraper'
import { CountriesData } from '../src/seeds/places/countries/data'
import { RegionsData } from '../src/seeds/places/regions/data'
import { CitiesData } from '../src/seeds/places/cities/data'
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

    const getPlacesFromRow = (row: DataScraperRow) => {
      let country = FindPlaceSeedDataInDataset({ dataset: countries, term: row.country })

      if (!country) {
        country = FindPlaceSeedDataInDataset({
          dataset: regions,
          term: row.country
        })
      }

      if (!country) {
        debugger
      }

      let place = country
      let jhuPlace = jhuData.find(r => r.countryId === country.id && !r.region && !r.city)

      if (country.id === 'united-states-of-america') {
        if (row.state) {
          // US State
          const state = FindPlaceSeedDataInDataset({
            dataset: regions.filter(r => r.parentId === country.id),
            term: row.state
          })
          place = state
          jhuPlace = jhuData.find(r => r.countryId === country.id && !r.city && r.region?.split(', ').pop() === state.alpha2code)

          if (row.county) {
            // US County
            const county = FindPlaceSeedDataInDataset({
              dataset: regions.filter(r => r.parentId === state.id),
              term: row.county
            })
            jhuPlace = jhuData.find(r => r.countryId === country.id && r.region?.includes(state.locales.en) && r.city?.includes(row.county))
            place = county
          }
        }
      } else {
        // Region
        const regionName = row.county || row.state

        if (regionName) {
          const region = FindPlaceSeedDataInDataset({
            dataset: regions.filter(r => r.parentId === country.id),
            term: regionName
          })

          jhuPlace = jhuData.find(r => r.countryId === country.id && r.region === region.locales.en)
          if (!region) debugger
          place = region
        }
      }
      if (!place) debugger

      return { place, jhuPlace }
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
        jhuPlace?: typeof jhuData[number]
      }
    }

    const data: PlaceSeedData = {
      ...cities.reduce((results, city) => ({ ...results, [city.id]: {  place: city } }), {}),
      ...regions.reduce((results, region) => ({ ...results, [region.id]: { place: region } }), {}),
      ...countries.reduce((results, country) => ({ ...results, [country.id]: { place: country } }), {}),
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
      const { place, jhuPlace } = getPlacesFromRow(entry)

      const { id } = place

      let cases = entry.cases ?? 0
      let deaths = entry.deaths ?? 0
      let recovered = entry.recovered ?? (entry.active && cases - deaths - entry.active) ?? 0

      if (jhuPlace) {
        const jhuValues = jhuPlace
        if (cases < jhuValues.cases) cases = jhuValues.cases
        if (deaths < jhuValues.deaths) deaths = jhuValues.deaths
        if (recovered < jhuValues.recovered) recovered = jhuValues.recovered
        data[id].jhuPlace = { ...jhuPlace }
      }
      data[id].data = new PlaceData({
        cases, deaths, recovered,
        placeId: id,
        date
      })

      if (jhuPlace) {
        const index = jhuData.indexOf(jhuPlace)
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

      if (data[id].data) {
        if (data[id].data.cases < cases) {
          data[id].data.cases = cases
        }
        if (data[id].data.deaths < deaths) {
          data[id].data.deaths = deaths
        }
        if (data[id].data.recovered < recovered) {
          data[id].data.recovered = recovered
        }
      } else {
        data[id].data = new PlaceData({
          cases, deaths, recovered,
          placeId: id,
          date
        })
      }

    }

    let idsToReaggregate: string[] = [
      ...new Set(
        Object.values(data)
        .filter(({ place }) => place.parentId
          // && place.typeId !== 'city'
          // && !place.locales.en.includes('County')
        )
        .map(({ place }) => place.parentId)
        )
    ]

    const reaggregate = () => {
      const ids = idsToReaggregate
      idsToReaggregate = []
      for (const [id, placeData] of Object.entries(data).filter(([ id ]) => ids.includes(id))) {
        const children = Object.values(data).filter(({ place }) => place.parentId === id)
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
          if (placeData.place.parentId && !idsToReaggregate.includes(placeData.place.parentId)) {
            idsToReaggregate.push(placeData.place.parentId)
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

    const dataPath = path.resolve(__dirname, '../src/seeds/places/place-data.json')
    await connect()
    const result: PlaceData[] = await PlaceData.find()

    for (const { data: newData } of Object.values(data).filter(({ data }) => data)) {
      const existingEntry = result.find(r => r.placeId === newData.placeId && r.date === date)
      if (existingEntry) {
        existingEntry.cases = newData.cases
        existingEntry.recovered = newData.recovered
        existingEntry.deaths = newData.deaths
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
    "cases": ${Math.round(data.cases)},
    "deaths": ${Math.round(data.deaths)},
    "recovered": ${Math.round(data.recovered)}
  }`).join(',\n  ')
    }
]
  `)

  }
}
