
import { Router } from 'express'
import { PlaceRequest } from '../places'
import { PlaceData } from '@coronatab/data'

const data = Router()

const SerializePlaceData = (placeData: PlaceData) => {
  return [placeData.date, placeData.cases, placeData.deaths, placeData.recovered]
}
data.get('/', async (req: PlaceRequest, res) => {
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
    data: placeData.map(pd => SerializePlaceData(pd))
  })
})

export { data }
