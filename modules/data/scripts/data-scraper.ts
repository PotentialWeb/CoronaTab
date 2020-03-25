import moment from 'moment'
import { DATE_FORMAT } from '@coronatab/shared'

interface DataScraperValues {
  cases: number
  active: number
  recovered?: number
  deaths?: number
}

export interface DataScraperRow extends DataScraperValues {
  country: string
  state?: string
  county?: string
  city?: string
  coordinates?: [number, number]
  featureId?: number
  population?: number
  url?: string
}

export class DataScraper {

  static get features () {
    return require('../coronadatascraper/dist/features.json')
  }

  static get timeseries () {
    interface TimeseriesEntry extends Exclude<DataScraperRow, 'cases' | 'active' | 'recovered' | 'deaths'> {
      dates: {
        [date: string]: DataScraperValues
      }
    }
    const timeseries: TimeseriesEntry[] = Object.values(require('../coronadatascraper/dist/timeseries-byLocation.json'))

    const data: { [date: string]: DataScraperRow[] } = {}

    timeseries
    .filter(entry => this.filterCruiseShips(entry))
    .forEach(place => {
      Object.entries(place.dates)
      .forEach(([date, values]) => {
        date = moment(date, 'YYYY-M-DD').format(DATE_FORMAT)
        data[date] = data[date] || []

          ;(data[date] as DataScraperRow[]).push({
            ...place,
            cases: values.cases ?? 0,
            deaths: values.deaths ?? 0,
            recovered: values.recovered ?? 0,
            active: values.active ?? 0
          })
      })
    })

    return data
  }

  static get latest () {
    const latest: DataScraperRow[] = require('../coronadatascraper/dist/data.json')
    return latest
      .filter(entry => this.filterCruiseShips(entry))
  }

  static filterCruiseShips (entry: DataScraperRow) {
    return !['Princess', 'Cruise Ship']
    .some(ignore => entry.country?.includes(ignore)
    || entry.state?.includes(ignore)
    || entry.county?.includes(ignore)
    )
  }
}
