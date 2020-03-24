import { connect, FindPlaceSeedDataInDataset, PlaceData } from '../src'
import { config as InjectEnvs } from 'dotenv'
import { RegionsData } from '../src/seeds/places/regions/data'
import { CitiesData } from '../src/seeds/places/cities/data'
import { CountriesData } from '../src/seeds/places/countries/data'
import { DataScraper, TimeseriesEntry } from './data-scraper'
import { JHU } from './jhu'

InjectEnvs()

;(async () => {
  const data = DataScraper.data
  const jhuData = await JHU.getOldTimeseriesData()

  const countries = CountriesData
  const regions = RegionsData
  const cities = CitiesData

  const getIDsFromEntry = (entry: TimeseriesEntry) => {
    let country = FindPlaceSeedDataInDataset({ dataset: countries, term: entry.country })

    if (!country) {
      country = FindPlaceSeedDataInDataset({
        dataset: regions,
        term: entry.country
      })
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
          jhuEntry = jhuData.find(r => r.countryId === country.id && r.region?.includes(state.locales.en))
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
        if (!region) debugger
        id = region.id
        parentId = country.id
      }
    }

    return { id, parentId, jhuEntry }
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
      jhuEntry?: typeof jhuData[number]
    }
  }

  const dates: {
    [date: string]: PlaceSeedData
  } = {}

  const getDefaultPlaceSet = (date: string) => ({
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
  })

  for (const entry of data) {
    const { id, parentId, jhuEntry } = getIDsFromEntry(entry)
    for (const [date, values] of Object.entries(entry.dates)) {
      dates[date] = dates[date] || getDefaultPlaceSet(date)

      dates[date][id] = dates[date][id] || {}
      let cases = values.cases ?? 0
      let deaths = values.deaths ?? 0
      let recovered = values.recovered ?? (values.active && cases - values.active) ?? 0
      if (jhuEntry?.dates?.[date]) {
        const jhuValues = jhuEntry.dates[date]
        if (cases < jhuValues.cases) cases = jhuValues.cases
        if (deaths < jhuValues.deaths) deaths = jhuValues.deaths
        if (recovered < jhuValues.recovered) recovered = jhuValues.recovered
        dates[date][id].jhuEntry = { ...jhuEntry }
        delete jhuEntry.dates[date]
      }
      dates[date][id].data = new PlaceData({
        cases, deaths, recovered,
        placeId: id,
        date
      })
      dates[date][id].parentId = parentId
    }

    if (jhuEntry && Object.keys(jhuEntry.dates).length === 0) {
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
    for (const [date, values] of Object.entries(entry.dates)) {
      dates[date] = dates[date] || getDefaultPlaceSet(date)

      dates[date][id] = dates[date][id] || {}
      let cases = values.cases ?? 0
      let deaths = values.deaths ?? 0
      let recovered = values.recovered ?? 0

      dates[date][id].data = new PlaceData({
        cases, deaths, recovered,
        placeId: id,
        date
      })
      dates[date][id].parentId = parentId
    }
  }

  for (const date of Object.keys(dates)) {
    const placeDatas = dates[date]
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

  }

  debugger

  // await connect()

  console.log('Success!')
  process.exit(0)
})().catch(err => {
  console.error(err)
  debugger
})
