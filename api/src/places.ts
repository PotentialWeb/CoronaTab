
import { Router, Request as ExpressRequest } from 'express'
import { Place, PlaceTypeIds, PlaceTypeId, PlaceData } from '@coronatab/data'
import { LocaleId, Types } from '@coronatab/shared'
import { Request } from './utils/request'
import 'express-async-errors'
import { data } from './places/data'
const places = Router()

export interface PlaceRequest extends ExpressRequest {
  place: Place
}

const SerializePlace = (place: Place, { locale }: { locale: LocaleId }) => {
  place.name = place.locales[locale]
  if (typeof place.location === 'string') {
    place.location = JSON.parse(place.location)
  }
  if (place.children?.length) {
    place.children = place.children
      .sort(CasesSorter)
      .map(child => SerializePlace(child, { locale }))
  }
  delete place.locales
  return place
}

const CasesSorter = (a: Place, b: Place) => a.latestData?.cases < b.latestData?.cases ? 1 : -1

const getLatestDataQuery = (alias: string) => `(
  SELECT json_build_object(
    'date', date,
    'cases', cases,
    'deaths', deaths,
    'recovered', recovered
  )
  FROM place_data
  WHERE "placeId" = ${alias}.id
  AND (cases > 0 OR deaths > 0 OR recovered > 0)
  ORDER BY cases DESC
  LIMIT 1
)`

type AllowedIncludesArray = typeof AllowedIncludes[number][]
const AllowedIncludes = ['children'] as const

places.get('/places', async (req, res) => {
  const locale = Request.getLocale(req)
  let { typeId, include: includes, offset, limit, name }: {
    typeId?: PlaceTypeId,
    include?: AllowedIncludesArray,
    limit?: number
    offset?: number
    name?: string
  } = req.query
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

  if (limit) {
    limit = parseInt(limit as any)
    if (isNaN(limit) || limit < 0) {
      return res.status(400).json({
        error: `Invalid parameter 'limit' must be an integer > 0`
      })
    }
  }

  if (offset) {
    offset = parseInt(offset as any)
    if (isNaN(offset) || offset < 0) {
      return res.status(400).json({
        error: `Invalid parameter 'offset' must be an integer > 0`
      })
    }
  }

  const query = Place.createQueryBuilder('place')
  .addSelect(`${getLatestDataQuery('place')} as "latestData"`)
  .andWhere(`${getLatestDataQuery('place')} IS NOT NULL`)
  .orderBy(`${getLatestDataQuery('place')}::jsonb->'cases'`, 'DESC')
  .groupBy('place.id')

  if (typeId) {
    query.andWhere('place."typeId" = :typeId', { typeId })
  }

  if (name) {
    query.andWhere(`(place.locales->>'${locale}') % :name`, { name })
  }

  if (limit) query.limit(limit)
  if (offset) query.offset(offset)

  if (includes?.length) {
    for (const include of includes) {
      switch (include) {
        case 'children': {
          query.addSelect(`jsonb_agg(
            jsonb_build_object(
              'id', child.id,
              'locales', child.locales,
              'typeId', child."typeId",
              'code', child.code,
              'location', ST_AsGeoJSON(child.location),
              'population', child.population,
              'latestData', ${getLatestDataQuery('child')}
            )
          ) as children`)
          query.leftJoin(Place, 'child', `child."parentId" = place.id AND ${getLatestDataQuery('child')} IS NOT NULL`)
          break
        }
        default: Types.unreachable(include)
      }
    }
  }

  const { entities: places, raw: rows } = await query.getRawAndEntities()
  for (const place of places) {
    const row = rows.find(r => r.place_id === place.id)
    place.latestData = row.latestData
    const children = row.children?.filter(c => !!c?.id)
    if (children?.length) place.children = children
  }

  res.json({
    data: places
      .map(p => SerializePlace(p, { locale }))
  })
})

places.get('/places/closest', async (req, res) => {
  const { typeId, include: includes }: { typeId: PlaceTypeId, include?: AllowedIncludesArray } = req.query

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

  const query = Place.createQueryBuilder('place')
  .addSelect(`${getLatestDataQuery('place')} as "latestData"`)
  .andWhere(`${getLatestDataQuery('place')} IS NOT NULL`)
  .groupBy('place.id')

  if (typeId) {
    query.andWhere('place."typeId" = :typeId', { typeId })
  }

  if (lat && lng) {
    query.orderBy(`(ST_DistanceSphere(ST_GeomFromText(:point, 4326), place.location::geometry))`, 'ASC')
    query.setParameters({ point: `POINT(${lng} ${lat})` })
    query.limit(5)
  } else {
    query.andWhere(`place.id = 'earth'`)
  }

  if (includes?.length) {
    for (const include of includes) {
      switch (include) {
        case 'children': {
          query.addSelect(`jsonb_agg(
            jsonb_build_object(
              'id', child.id,
              'locales', child.locales,
              'typeId', child."typeId",
              'code', child.code,
              'location', ST_AsGeoJSON(child.location),
              'population', child.population,
              'latestData', ${getLatestDataQuery('child')}
            )
          ) as children`)
          query.leftJoin(Place, 'child', `child."parentId" = place.id AND ${getLatestDataQuery('child')} IS NOT NULL`)
          break
        }
        default: Types.unreachable(include)
      }
    }
  }

  const { entities: places, raw: rows } = await query.getRawAndEntities()
  for (const place of places) {
    const row = rows.find(r => r.place_id === place.id)
    place.latestData = row.latestData
    const children = row.children?.filter(c => !!c?.id)
    if (children?.length) place.children = children
  }

  res.json({
    data: places
      .map(p => SerializePlace(p, { locale: Request.getLocale(req) }))
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
  await place.getLatestData()
  req.place = place
  next()
})

places.get('/places/:id', async (req: PlaceRequest, res) => {
  const { place } = req

  const { include: includes }: { include?: AllowedIncludesArray } = req.query
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
          await Promise.all(place.children.map(c => c.getLatestData()))
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
