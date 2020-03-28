import { config as InjectEnvs } from 'dotenv'
import { DataScraper } from './data-scraper'
import { JHU } from './jhu'
import { Data } from './data'

InjectEnvs()

;(async () => {
  const scraperDatas = DataScraper.timeseries
  const jhuDatas = await JHU.getOldTimeseriesData()

  const dates = [
    ...new Set([
      ...Object.keys(scraperDatas),
      ...Object.keys(jhuDatas)
    ])
  ]
  .filter(date => date >= '2020-03-20') // TODO: Remove this

  for (const date of dates) {
    console.log(`Recalculating for date: ${date}`)
    await Data.recalculate({
      date,
      jhuData: (jhuDatas[date] ?? [])
      // .filter(row => row.countryId === 'united-states-of-america')
      ,
      scraperData: (scraperDatas[date] ?? [])
      // .filter(row => row.country === 'USA')
    })
  }

  console.log('Success!')
  process.exit(0)
})().catch(err => {
  console.error(err)
  debugger
})
