import { FindPlaceSeedDataInDataset, PlaceData, Place, EarthPlace, connect } from '../src'
import { JHUDataRow, JHU } from './jhu'
import { DataScraperRow } from './data-scraper'
import { CountriesData } from '../src/seeds/places/countries/seeds'
import { RegionsData } from '../src/seeds/places/regions/seeds'
import { CitiesData } from '../src/seeds/places/cities/seeds'
import { SavePlaceDatas } from '../src/seeds/places/data'
import { Translate } from '@coronatab/node-utils'

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

    const USStatesCodeMap = require('./us-states-code-map.json')
    const FIPSMap: {
      fips: number
      city?: string
      region?: string
      country: string
    }[] = require('./fips-map.json')

    const getPlacesFromRow = async (row: DataScraperRow) => {
      row.country = row.country.replace(/iso\d+:/g, '')

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
          const stateName = USStatesCodeMap[row.state] ?? row.state.replace(/iso\d+:US-/g, '')
          // US State
          const state = FindPlaceSeedDataInDataset({
            dataset: regions.filter(r => r.parentId === country.id),
            term: stateName
          })
          place = state
          jhuPlace = jhuData.find(r => r.countryId === country.id && !r.city && r.region?.split(', ').pop() === state.alpha2code)

          if (row.county && row.county !== state.locales.en) {
            // US County
            let countyName = row.county
            if (countyName.includes('fips')) {
              const fipsCode = parseInt(countyName.replace('fips:', ''))
              const fipsEntry = FIPSMap.find(e => e.fips === fipsCode)
              if (!fipsEntry) debugger
              countyName = fipsEntry.region
            }
            const county = FindPlaceSeedDataInDataset({
              dataset: regions.filter(r => r.parentId === state.id),
              term: countyName
            })
            jhuPlace = jhuData.find(r => r.countryId === country.id && r.region?.includes(state.locales.en) && r.city?.includes(countyName))
            place = county

            if (row.city && row.city !== county.locales.en) {
              // US City
              let cityName = row.city
              if (cityName.includes('fips')) {
                const fipsCode = parseInt(cityName.replace('fips:', ''))
                const fipsEntry = FIPSMap.find(e => e.fips === fipsCode)
                if (!fipsEntry) debugger
                cityName = fipsEntry.city
              }
              const city = FindPlaceSeedDataInDataset({
                dataset: cities.filter(r => r.parentId === county.id),
                term: cityName
              })
              jhuPlace = jhuData.find(r => r.countryId === country.id && r.region?.includes(state.locales.en) && r.city?.includes(cityName))
              place = city
            }
          }
        }
      } else {
        // Region
        let regionName = row.county || row.state

        if (regionName) {
          if (country.id === 'russia' && !regionName.includes('a')) {
            // translate russian region
            regionName = await Translate.text({ from: 'ru', to: 'en', text: regionName })
          }
          const region = FindPlaceSeedDataInDataset({
            dataset: regions.filter(r => r.parentId === country.id),
            term: regionName
          })
          if (!region) debugger

          jhuPlace = jhuData.find(r => r.countryId === country.id && r.region === region.locales.en)
          place = region

          if (row.city) {
            const city = FindPlaceSeedDataInDataset({
              dataset: cities.filter(c => c.parentId === region.id),
              term: row.city
            })
            if (!city) debugger

            jhuPlace = jhuData.find(r => r.countryId === country.id && r.region === region.locales.en && r.city === city.locales.en)
            place = city
          }
        }
      }

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
      const { place, jhuPlace } = await getPlacesFromRow(entry)

      if (!place) {
        debugger
        continue
      }

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

    await SavePlaceDatas({ datas: result })

  }
}
