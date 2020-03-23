import moment from 'moment'
import { DATE_FORMAT } from '@coronatab/shared'

interface Place {
  country: string
  state?: string
  county?: string
  city?: string
  coordinates?: [number, number]
  featureId?: number
  population?: number
  url?: string
}

interface Values {
  cases: number
  active: number
  recovered?: number
  deaths?: number
}

interface DateValues {
  [date: string]: Values
}
interface TodayEntry extends Place, Values {}

interface TimeseriesEntry extends Place {
  dates: DateValues
}

export class DataScraper {

  static get features () {
    return require('../coronadatascraper/dist/features.json')
  }

  static get data () {
    const today: TodayEntry[] = require('../coronadatascraper/dist/data.json')
    const timeseries: TimeseriesEntry[] = Object.values(require('../coronadatascraper/dist/timeseries-byLocation.json'))

    const dataSet: { [id: string]: TimeseriesEntry } = {}

    // Get unique places from Todays data and Timeseries
    const upsertPlace = ({ place, dates }: { place: Place, dates: DateValues }) => {
      const id = `${place.country}-${place.state}-${place.county}-${place.city}`
      dataSet[id] = {
        country: dataSet[id]?.country ?? place.country,
        state: dataSet[id]?.state ?? place.state,
        county: dataSet[id]?.county ?? place.county,
        city: dataSet[id]?.city ?? place.city,
        coordinates: dataSet[id]?.coordinates ?? place.coordinates,
        featureId: dataSet[id]?.featureId ?? place.featureId,
        population: dataSet[id]?.population ?? place.population,
        url: dataSet[id]?.url ?? place.url,
        dates: Object.entries(dates).reduce((result, [ date, values ]) => {
          result[date] = {
            cases: result[date].cases > values.cases ? result[date].cases : values.cases,
            active: result[date].active > values.active ? result[date].active : values.active,
            recovered: result[date].recovered > values.recovered ? result[date].recovered : values.recovered,
            deaths: result[date].deaths > values.deaths ? result[date].deaths : values.deaths
          }
          return result
        }, dataSet[id]?.dates ?? {})
      }
    }

    today.forEach(place => upsertPlace({ place, dates: {
      [moment().format(DATE_FORMAT)]: {
        cases: place.cases,
        active: place.active,
        recovered: place.recovered,
        deaths: place.deaths
      }
    }}))

    timeseries.forEach(place => upsertPlace({
      place,
      dates: Object.entries(place.dates).reduce((dates, [date, values]) => {
        dates[moment(date, 'YYYY-M-DD').format(DATE_FORMAT)] = values
        return dates
      }, {} as DateValues)
    }))

    return Object.values(dataSet)
  }
}
