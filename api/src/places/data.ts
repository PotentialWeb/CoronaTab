
import { Router } from 'express'
import { PlaceRequest } from '../places'
import { PlaceData, Place } from '@coronatab/data'
import 'express-async-errors'
import Filter from 'taira'
import { Constants } from '../constants'
import { Arrays, DATE_FORMAT } from '@coronatab/shared'
import moment from 'moment'

const data = Router()

const SerializePlaceData = (placeData: PlaceData, { compact }: { compact?: boolean }) => {
  if (compact) {
    return [placeData.date, placeData.cases, placeData.deaths, placeData.recovered]
  } else {
    delete placeData.placeId
    return placeData
  }
}

const SmoothFilter = (data: PlaceData[]) => {
  if (data.length <= 3) return data
  for (let i = 0; i < data.length; i++) {
    let prev = data[i - 1]
    if (prev) {
      if (data[i].cases < prev.cases) data[i].cases = prev.cases
      if (data[i].deaths < prev.deaths) data[i].deaths = prev.deaths
      if (data[i].recovered < prev.recovered) data[i].recovered = prev.recovered
    }
  }
  let cases = data.map(d => d.cases)
  let deaths = data.map(d => d.deaths)
  let recovered = data.map(d => d.recovered)

  const smooth = (values: number[]): number[] => Filter.smoothen(values, Filter.ALGORITHMS.GAUSSIAN, 1, 1, false).map(num => Math.round(num))

  cases = smooth(cases)
  deaths = smooth(deaths)
  recovered = smooth(recovered)

  for (let i = 0; i < data.length; i++) {
    data[i].cases = cases[i]
    data[i].deaths = deaths[i]
    data[i].recovered = recovered[i]
  }

  return data
}

const FillMissingDays = (data: PlaceData[]) => {
  for (let i = 0; i < data.length;) {
    const current = data[i]
    const next = data[i + 1]
    if (!next) break
    const diff = moment(next.date).diff(moment(current.date), 'days')
    if (diff > 1) {
      const casesIncreasePerDay = Math.round((next.cases - current.cases) / diff)
      const deathsIncreasePerDay = Math.round((next.deaths - current.deaths) / diff)
      const recoveredIncreasePerDay = Math.round((next.recovered - current.recovered) / diff)
      // console.log()
      for (let d = 1; d < diff; d++) {
        const nextDayData = new PlaceData({
          placeId: current.placeId,
          date: moment(current.date).add(d, 'day').format(DATE_FORMAT),
          cases: current.cases + d * casesIncreasePerDay,
          deaths: current.deaths + d * deathsIncreasePerDay,
          recovered: current.recovered + d * recoveredIncreasePerDay
        })
        data.splice(i + d, 0, nextDayData)
      }
    }
    i += diff
  }
  return data
}

const ProjectPlaceData = (placeDatas: PlaceData[]) => {
  if (placeDatas.length <= Constants.DATA_PROJECTION_BASE_DAYS) return []
  const lastDatas = placeDatas.slice(placeDatas.length - Constants.DATA_PROJECTION_BASE_DAYS - 1, placeDatas.length)

  const changeRates = lastDatas.reduce((rates, data, i) => {
    const nextData = lastDatas[i + 1]
    if (nextData) {
      rates.cases.push(data.cases ? nextData.cases / data.cases : 2)
      rates.deaths.push(data.deaths ? nextData.deaths / data.deaths : 2)
      rates.recovered.push(data.recovered ? nextData.recovered / data.recovered : 2)
    }
    return rates
  }, {
    cases: [] as number[],
    deaths: [] as number[],
    recovered: [] as number[]
  })

  const casesChangeRate = Arrays.average(changeRates.cases)
  const deathsChangeRate = Arrays.average(changeRates.deaths)
  const recoveredChangeRate = Arrays.average(changeRates.recovered)

  const lastData = lastDatas[lastDatas.length - 1]
  let cases = lastData.cases
  let deaths = lastData.deaths
  let recovered = lastData.recovered
  const projected: PlaceData[] = []
  const lastDate = lastData.date
  const { placeId } = lastData
  for (let i = 1; i <= Constants.DATA_PROJECTION_DEFAULT_DAYS; i++) {
    cases = Math.round(cases * casesChangeRate)

    deaths = Math.round(deaths * deathsChangeRate)
    if (deaths > cases - recovered) deaths = cases - recovered

    recovered = Math.round(recovered * recoveredChangeRate)
    if (recovered > cases - deaths) recovered = cases - deaths

    const date = moment(lastDate).add(i, 'days').format(DATE_FORMAT)
    projected.push(new PlaceData({
      date,
      recovered,
      cases,
      deaths,
      placeId
    }))
  }
  return projected
}
data.get('/', async (req: PlaceRequest, res) => {
  let { compact } = req.query
  compact = compact === 'true'
  const { place } = req
  const query = PlaceData.createQueryBuilder('data')
  .where('"placeId" = :placeId', { placeId: place.id })
  .andWhere(`(cases > 0 OR deaths > 0 OR recovered > 0)`)
  .orderBy('date', 'ASC')

  const placeData = SmoothFilter(
    FillMissingDays(
      await query.getMany()
    )
  )
  res.json({
    data: placeData.map(pd => SerializePlaceData(pd, { compact })),
    meta: {
      projected: ProjectPlaceData(placeData).map(pd => SerializePlaceData(pd, { compact }))
    }
  })
})

export { data }
