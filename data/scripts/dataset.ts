import { File } from '../utils/file'
import CSV from 'csvtojson'

const CASES_CSV_URL = 'https://github.com/CSSEGISandData/COVID-19/raw/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv'
const DEATHS_CSV_URL = 'https://github.com/CSSEGISandData/COVID-19/raw/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv'
const RECOVERED_CSV_URL = 'https://github.com/CSSEGISandData/COVID-19/raw/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv'

const META_COLUMNS = [
  'Province/State',
  'Country/Region',
  'Lat',
  'Long'
] as const
type MetaColumnType = typeof META_COLUMNS[number]

type DataSetRow = { [meta in MetaColumnType]: string } & { [date: string]: string }

;(async () => {
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
  const cases: DataSetRow[] = await CSV().fromStream(casesStream as any)
  const recovered: DataSetRow[] = await CSV().fromStream(recoveredStream as any)
  const deaths: DataSetRow[] = await CSV().fromStream(deathsStream as any)

  
})()
