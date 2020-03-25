import { config as InjectEnvs } from 'dotenv'
import { DataScraper } from './data-scraper'
import { JHU } from './jhu'
import { Data } from './data'

InjectEnvs()

;(async () => {
  const scraperDatas = DataScraper.timeseries
  const jhuDatas = await JHU.getOldTimeseriesData()

  const dates = [
    ...new Set(
      ...Object.keys(scraperDatas),
      ...Object.keys(jhuDatas)
    )
  ]

  await Promise.all(dates.map(date => Data.recalculate({
    date,
    jhuData: jhuDatas[date] ?? [],
    scraperData: scraperDatas[date] ?? []
  })))

  console.log('Success!')
  process.exit(0)
})().catch(err => {
  console.error(err)
  debugger
})
