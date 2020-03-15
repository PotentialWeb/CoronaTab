import { File } from '@coronatab/node-utils'
import CSV from 'csvtojson'
import { Place, PlaceData, connect } from '@coronatab/data'
import dasherize from 'dasherize'
import moment from 'moment'

import { config as injectEnvs } from 'dotenv'
import { DATE_FORMAT } from '../shared/constants'
injectEnvs()

const CASES_CSV_URL = 'https://github.com/CSSEGISandData/COVID-19/raw/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv'
const DEATHS_CSV_URL = 'https://github.com/CSSEGISandData/COVID-19/raw/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv'
const RECOVERED_CSV_URL = 'https://github.com/CSSEGISandData/COVID-19/raw/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv'

const RAW_ROW_META_COLUMNS = [
  'Province/State',
  'Country/Region',
  'Lat',
  'Long'
] as const
type RawRowMetaColumn = typeof RAW_ROW_META_COLUMNS[number]

type RawDataRow = { [meta in RawRowMetaColumn]: string } & { [date: string]: string }
type NormalizedDataRow = {
  country: string
  region: string
  lat: number
  lng: number
  data: { [date: string]: number }
}

;(async () => {
  await connect()

  console.log('Downloading dataset')
  const [
    casesStream,
    recoveredStream,
    deathsStream
  ] = await Promise.all([
    File.download({
      url: CASES_CSV_URL,
      return: 'Stream'
    }),
    File.download({
      url: RECOVERED_CSV_URL,
      return: 'Stream'
    }),
    File.download({
      url: DEATHS_CSV_URL,
      return: 'Stream'
    })
  ])

  const [
    casesRawRows,
    recoveredRawRows,
    deathsRawRows
  ]: RawDataRow[][] = await Promise.all([
    CSV().fromStream(casesStream as any),
    CSV().fromStream(recoveredStream as any),
    CSV().fromStream(deathsStream as any)
  ])

  console.log('Dataset download finished. Processing...')
    // This function will normalize the raw dataset row into a structure that's easy to work with
  const normalizeRow = (row: RawDataRow): NormalizedDataRow => {
    return {
      country: row['Country/Region'],
      region: row['Province/State'],
      lat: parseFloat(row.Lat),
      lng: parseFloat(row.Long),
      data: Object.entries(row)
            .filter(([key]) => !RAW_ROW_META_COLUMNS.includes(key as RawRowMetaColumn))
            .reduce((dates, [ date, value ]) => {
              dates[moment(new Date(date)).format(DATE_FORMAT)] = parseInt(value)
              return dates
            }, {} as { [date: string]: number })
    }
  }

  const casesRows = casesRawRows.map(row => normalizeRow(row))
  const deathsRows = deathsRawRows.map(row => normalizeRow(row))
  const recoveredRows = recoveredRawRows.map(row => normalizeRow(row))

  const countryModels = await Place.find({
    where: {
      typeId: 'country'
    }
  })

  const countryCodeMap: { [name: string]: string } = require('./country-code-map.json')

  const placesToSave: Place[] = []
  const placeDataToSave: PlaceData[] = []

  for (const casesRow of casesRows.filter(r => r.country !== 'Cruise Ship')) {
    const deathsRow = deathsRows.find(dr => dr.country === casesRow.country && dr.region === casesRow.region)
    const recoveredRow = recoveredRows.find(rr => rr.country === casesRow.country && rr.region === casesRow.region)

    const country = countryModels.find(c => c.code === countryCodeMap[casesRow.country])
    if (!country) {
      console.error(`Country not found in DB`, casesRow.country, countryCodeMap[casesRow.country])
      process.exit(1)
    }
    let region: Place
    if (!casesRow.region || casesRow.region === casesRow.country) {
      country.location = {
        type: 'Point',
        coordinates: [casesRow.lng, casesRow.lat]
      }
    } else {
      // Region row
      const name = casesRow.region
      const subId = dasherize(name.replace(/,|\.| /g, ''))
      region = new Place({
        id: `${country.id}-${subId}`,
        typeId: 'region',
        locales: {
          en: name
        },
        location: {
          type: 'Point',
          coordinates: [casesRow.lng, casesRow.lat]
        },
        parentId: country.id
      })
    }

    const place = region || country
    placesToSave.push(place)
    for (const [date, cases] of Object.entries(casesRow.data)) {
      const deaths = deathsRow.data[date] ?? 0
      const recovered = recoveredRow.data[date] ?? 0
      placeDataToSave.push(new PlaceData({
        placeId: place.id,
        date,
        cases,
        deaths,
        recovered
      }))
    }
  }

  console.log('Updating places')
  await Place.save(placesToSave)

  console.log('Ingesting data')
  await PlaceData.save(placeDataToSave, { chunk: 1000 })

})()
