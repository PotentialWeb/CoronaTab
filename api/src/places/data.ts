
import { Router } from 'express'
import { PlaceRequest } from '../places'
import { PlaceData } from '@coronatab/data'

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
  const placeData = await PlaceData.find({
    where: {
      placeId: place.id
    },
    order: {
      date: 'ASC'
    }
  })
  res.json({
    data: placeData.map(pd => SerializePlaceData(pd, { compact }))
  })
})

export { data }
