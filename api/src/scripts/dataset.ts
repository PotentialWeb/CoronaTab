import { File } from '../utils/file'
import { CASES_CSV_URL, RECOVERED_CSV_URL, DEATHS_CSV_URL } from '../constants'
import CSV from 'csvtojson'

const META_COLUMNS = [
  'Province/State',
  'Country/Region',
  'Lat',
  'Long'
] as const
type MetaColumnType = typeof META_COLUMNS[number]

type DataSetRow = { [meta in MetaColumnType]: string } & { [date: string]: string }

(async () => {
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
