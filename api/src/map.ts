
import { Router } from 'express'
import 'express-async-errors'
import { PlaceType, PlaceTypes, Place } from '@coronatab/data'
import { LocaleId } from '@coronatab/shared'
import { CoronaTabRequest } from './api'
import { getLatestDataQuery } from './places'
const map = Router()

const SerializePlace = (place: any, { compact }: { compact: boolean }) => {
  // place.name = place.locales[locale] || place.locales.en
  if (typeof place.location === 'string') {
    place.location = JSON.parse(place.location)
  }

  for (const [key, value] of Object.entries(place)) {
    if (value === null) {
      delete place[key]
    }
  }
  if (compact) {
    const { date, cases, deaths, recovered } = place.latestData
    return [
      place.id,
      place.alpha2code,
      place.name,
      place.location.coordinates,
      place.parentName,
      [date, cases, deaths, recovered]
    ]
  } else {
    return place
  }
}

map.get('/', async (req: CoronaTabRequest, res) => {
  const { locale } = req
  let { compact } = req.query
  compact = compact === 'true'

  const query = Place.createQueryBuilder('place')
  .select([
    'place.id as id',
    `COALESCE(place."alpha2code", (select "alpha2code" from place pp where pp.id = place."parentId")) as "alpha2code"`,
    `ST_AsGeoJSON("place"."location")::json as location`,
    `COALESCE(place.locales->'${locale}', place.locales->'en') as name`,
    `${getLatestDataQuery('place')} as "latestData"`,
    `(select COALESCE(pp.locales->'${locale}', pp.locales->'en') from place pp where pp.id = place."parentId" AND pp.id != 'earth') as "parentName"`
  ])
  .leftJoin(Place, 'child', `child."parentId" = place.id`)
  .andWhere('place.location IS NOT NULL')
  .andWhere(`${getLatestDataQuery('place')} IS NOT NULL`)
  .orderBy(`${getLatestDataQuery('place')}::jsonb->'cases'`, 'DESC')
  .groupBy('place.id')
  .andHaving(`COUNT(child) = 0`)

  // console.log(query.getSql())
  const places = await query.getRawMany()

  res.json({
    data: places
      .map(p => SerializePlace(p, { compact }))
  })
})

export { map }
