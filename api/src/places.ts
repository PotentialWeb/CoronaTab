
import { Router } from 'express'
import { Place, PlaceTypeIds, PlaceTypeId } from '@coronatab/data'
import { LocaleId } from '@coronatab/shared'
import { Request } from './utils/request'
import { FindManyOptions } from 'typeorm'
const places = Router()

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
    lng = lookup.ll[0]
    lat = lookup.ll[1]
  }

  console.log({ lng, lat })

  // const place = await Place.findClosest({ lng, lat })
  const query = Place.createQueryBuilder('place')
    .select([
      'place',
      `ST_DistanceSphere(ST_GeomFromText('POINT(:lat :lng)', 4326), location::geometry) as distance`
    ])
    .setParameters({ lng, lat })
    .where('location IS NOT NULL')
    .orderBy('distance', 'ASC')

  console.log(query.getSql())
  const place = await query.getOne()

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

places.get('/places/:id', async (req, res) => {
  const { include: includes }: { include?: typeof AllowedIncludes[number][] } = req.query
  if (includes?.length && (!Array.isArray(includes) || includes.some(i => !AllowedIncludes.includes(i)))) {
    return res.status(400).json({
      error: 'Invalid includes parameter.'
    })
  }
  const { id } = req.params
  const place = await Place.findOne({ id })
  if (!place) {
    return res.status(404).send({
      error: `Place not found.`
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

export { places }
