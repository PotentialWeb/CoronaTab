
import { Router, Request as ExpressRequest } from 'express'
import { Place, PlaceTypeIds, PlaceTypeId } from '@coronatab/data'
import { LocaleId } from '@coronatab/shared'
import { Request } from './utils/request'
import { FindManyOptions } from 'typeorm'
import { data } from './places/data'
const places = Router()

export interface PlaceRequest extends ExpressRequest {
  place: Place
}

const SerializePlace = (place: Place, { locale }: { locale: LocaleId }) => {
  place.name = place.locales[locale]
  if (place.children?.length) {
    place.children = place.children.map(child => SerializePlace(child, { locale }))
  }
  delete place.locales
  return place
}
const AllowedIncludes = ['children'] as const

places.get('/places', async (req, res) => {
  const { typeId, include: includes }: { typeId?: PlaceTypeId, include?: typeof AllowedIncludes[number][] } = req.query
  if (typeId && !PlaceTypeIds.includes(typeId)) {
    return res.status(400).json({
      error: 'Place Type ID not found.'
    })
  }
  if (includes?.length && (!Array.isArray(includes) || includes.some(i => !AllowedIncludes.includes(i)))) {
    return res.status(400).json({
      error: 'Invalid includes parameter.'
    })
  }

  const findOpts: FindManyOptions<Place> = {}

  if (typeId) {
    findOpts.where = { typeId }
  }
  const places = (await Place.find(findOpts))

  if (includes?.length && places?.length) {
    for (const include of includes) {
      switch (include) {
        case 'children': {
          await Promise.all(places.map(async place => {
            place.children = await place.getChildren()
          }))
          break
        }
      }
    }
  }
  res.json({
    data: places.map(p => SerializePlace(p, { locale: Request.getLocale(req) }))
  })
})

places.get('/places/closest', async (req, res) => {
  const { include: includes }: { include?: typeof AllowedIncludes[number][] } = req.query
  if (includes?.length && (!Array.isArray(includes) || includes.some(i => !AllowedIncludes.includes(i)))) {
    return res.status(400).json({
      error: 'Invalid includes parameter.'
    })
  }
  let { lng, lat } = req.query
  if ((lng && isNaN(lng)) || (lat && isNaN(lat))) {
    return res.status(400).json({
      error: `Invalid lng or lat parameter.`
    })
  }
  if (!lng || !lat) {
    const lookup = Request.getGeo(req)
    lng = lookup?.ll?.[1]
    lat = lookup?.ll?.[0]
  }

  const places = !!lng && !!lat ? await Place.getClosest({ lng, lat, limit: 5 }) : [await Place.findOne({ id: 'earth' })]

  if (includes?.length && places?.length) {
    for (const include of includes) {
      switch (include) {
        case 'children': {
          await Promise.all(places.map(async place => {
            place.children = await place.getChildren()
          }))
          break
        }
      }
    }
  }

  res.json({
    data: places.map(p => SerializePlace(p, { locale: Request.getLocale(req) }))
  })
})

places.use('/places/:id', async (req: PlaceRequest, res, next) => {
  const { id } = req.params
  const place = await Place.findOne({ id })
  if (!place) {
    return res.status(404).send({
      error: `Place not found.`
    })
  }
  req.place = place
  next()
})

places.get('/places/:id', async (req: PlaceRequest, res) => {
  const { place } = req

  const { include: includes }: { include?: typeof AllowedIncludes[number][] } = req.query
  if (includes?.length && (!Array.isArray(includes) || includes.some(i => !AllowedIncludes.includes(i)))) {
    return res.status(400).json({
      error: 'Invalid includes parameter.'
    })
  }

  if (includes?.length && places?.length) {
    for (const include of includes) {
      switch (include) {
        case 'children': {
          place.children = await place.getChildren()
          break
        }
      }
    }
  }

  res.json({
    data: SerializePlace(place, { locale: Request.getLocale(req) })
  })
})

places.use('/places/:id/data', data)

export { places }
