import { config as InjectEnvs } from 'dotenv'
import { DataScraper } from './data-scraper'
import { JHU } from './jhu'
import moment from 'moment'
import { DATE_FORMAT } from '@coronatab/shared'
import { Data } from './data'

InjectEnvs()

;(async () => {
  const date = moment().format(DATE_FORMAT)
  const scraperData = DataScraper.latest
  const jhuData = await JHU.getLatestData()

  await Data.recalculate({
    date,
    scraperData: scraperData
    // .filter(row => row.country === 'USA')
    ,
    jhuData: jhuData
    // .filter(row => row.countryId === 'united-states-of-america')
  })

  console.log('Success!')
  process.exit(0)
})().catch(err => {
  console.error(err)
  debugger
})
