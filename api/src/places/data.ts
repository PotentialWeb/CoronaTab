
import { Router } from 'express'
import { PlaceRequest } from '../places'
import { PlaceData } from '@coronatab/data'
import 'express-async-errors'
import Filter from 'taira'
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
  if (data.length < 2) return data
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
data.get('/', async (req: PlaceRequest, res) => {
  let { compact } = req.query
  compact = compact === 'true'
  const { place } = req
  const query = PlaceData.createQueryBuilder('data')
  .where('"placeId" = :placeId', { placeId: place.id })
  .andWhere(`(cases > 0 OR deaths > 0 OR recovered > 0)`)
  .orderBy('date', 'ASC')

  const placeData = await query.getMany()
  res.json({
    data: SmoothFilter(placeData).map(pd => SerializePlaceData(pd, { compact }))
  })
})

export { data }
