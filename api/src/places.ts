
import { Router } from 'express'
import { Place, PlaceTypeIds, PlaceTypeId, PlaceData } from '@coronatab/data'
import { LocaleId, Types } from '@coronatab/shared'
import { Requests } from './utils/requests'
import 'express-async-errors'
import { data } from './places/data'
import { types } from './places/types'
import { CoronaTabRequest } from './api'
const places = Router()

export interface PlaceRequest extends CoronaTabRequest {
  place: Place
}

const SerializePlace = (place: Place) => {
  // place.name = place.locales[locale] || place.locales.en
  if (typeof place.location === 'string') {
    place.location = JSON.parse(place.location)
  }
  if (place.children?.length) {
    place.children = place.children
      .sort(CasesSorter)
      .map(child => SerializePlace(child))
  }
  delete place.locales
  for (const [key, value] of Object.entries(place)) {
    if (value === null) {
      delete place[key]
    }
  }
  if (place.population) place.population = parseInt(place.population as any)
  return place
}

const CasesSorter = (a: Place, b: Place) => a.latestData?.cases < b.latestData?.cases ? 1 : -1

export const getLatestDataQuery = (alias: string) => `(
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

places.get('/', async (req: CoronaTabRequest, res) => {
  const { locale } = req
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
  .addSelect(`COALESCE(place.locales->'${locale}', place.locales->'en') as name`)
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
              'name', COALESCE(child.locales->'${locale}', child.locales->'en'),
              'typeId', child."typeId",
              'alpha2code', child.alpha2code,
              'alpha3code', child.alpha3code,
              'dataSource', child."dataSource",
              'hospitalBeds', child."hospitalBeds",
              'icuBeds', child."icuBeds",
              'hospitalBedOccupancy', child."hospitalBedOccupancy",
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
    place.name = row.name
    const children = row.children?.filter(c => !!c?.id)
    if (children?.length) place.children = children
  }

  res.json({
    data: places
      .map(p => SerializePlace(p))
  })
})

places.use('/types', types)

places.get('/closest', async (req: CoronaTabRequest, res) => {
  const { typeId, include: includes }: { typeId: PlaceTypeId, include?: AllowedIncludesArray } = req.query
  const { locale } = req

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
    const lookup = Requests.getGeo(req)
    lng = lookup?.ll?.[1]
    lat = lookup?.ll?.[0]
  }

  const query = Place.createQueryBuilder('place')
  .addSelect(`${getLatestDataQuery('place')} as "latestData"`)
  .addSelect(`COALESCE(place.locales->'${locale}', place.locales->'en') as name`)
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
              'name', COALESCE(child.locales->'${locale}', child.locales->'en'),
              'typeId', child."typeId",
              'alpha2code', child.alpha2code,
              'alpha3code', child.alpha3code,
              'dataSource', child."dataSource",
              'hospitalBeds', child."hospitalBeds",
              'icuBeds', child."icuBeds",
              'hospitalBedOccupancy', child."hospitalBedOccupancy",
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

  console.log(query.getSql())

  const { entities: places, raw: rows } = await query.getRawAndEntities()
  for (const place of places) {
    const row = rows.find(r => r.place_id === place.id)
    place.latestData = row.latestData
    place.name = row.name
    const children = row.children?.filter(c => !!c?.id)
    if (children?.length) place.children = children
  }

  res.json({
    data: places
      .map(p => SerializePlace(p))
  })
})

places.use('/:id', async (req: PlaceRequest, res, next) => {
  const { id } = req.params
  const { locale } = req
  let { include: includes }: { include?: AllowedIncludesArray } = req.query

  if (includes?.length && (!Array.isArray(includes) || includes.some(i => !AllowedIncludes.includes(i)))) {
    return res.status(400).json({
      error: 'Invalid includes parameter.'
    })
  }

  const query = Place.createQueryBuilder('place')
  .addSelect(`COALESCE(place.locales->'${locale}', place.locales->'en') as name`)
  .addSelect(`${getLatestDataQuery('place')} as "latestData"`)
  .andWhere('place.id = :id', { id })
  .groupBy('place.id')

  if (includes?.length) {
    for (const include of includes) {
      switch (include) {
        case 'children': {
          query.addSelect(`jsonb_agg(
            jsonb_build_object(
              'id', child.id,
              'name', COALESCE(child.locales->'${locale}', child.locales->'en'),
              'typeId', child."typeId",
              'alpha2code', child.alpha2code,
              'alpha3code', child.alpha3code,
              'dataSource', child."dataSource",
              'hospitalBeds', child."hospitalBeds",
              'icuBeds', child."icuBeds",
              'hospitalBedOccupancy', child."hospitalBedOccupancy",
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
  const place = places[0]
  const row = rows[0]
  place.latestData = row.latestData
  place.name = row.name
  const children = row.children?.filter(c => !!c?.id)
  if (children?.length) place.children = children

  req.place = place
  next()
})

places.get('/:id', async (req: PlaceRequest, res) => {
  const { place } = req

  res.json({
    data: SerializePlace(place)
  })
})

places.use('/:id/data', data)

export { places }
