
import { Router } from 'express'
import { PlaceRequest } from '../places'
import { PlaceData } from '@coronatab/data'
import 'express-async-errors'

const data = Router()

const SerializePlaceData = (placeData: PlaceData, { compact }: { compact?: boolean }) => {
  if (compact) {
    return [placeData.date, placeData.cases, placeData.deaths, placeData.recovered]
  } else {
    delete placeData.placeId
    return placeData
  }
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
    data: placeData.map(pd => SerializePlaceData(pd, { compact }))
  })
})

export { data }
