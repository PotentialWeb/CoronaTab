import { PlaceType } from '../../place/type'
import { Types } from '../../utils/types'

export const PlaceTypeIds = [
  'planet',
  'country',
  'region',
  'city'
] as const

export type PlaceTypeId = typeof PlaceTypeIds[number]

export const PlaceTypes: PlaceType[] = PlaceTypeIds.map(id => {
  switch (id) {
    case 'planet': {
      return new PlaceType({
        id,
        locales: {
          en: 'Planet'
        }
      })
    }
    case 'country': {
      return new PlaceType({
        id,
        locales: {
          en: 'Country'
        }
      })
    }
    case 'region': {
      return new PlaceType({
        id,
        locales: {
          en: 'Region'
        }
      })
    }
    case 'city': {
      return new PlaceType({
        id,
        locales: {
          en: 'City'
        }
      })
    }
    default: Types.unreachable(id)
  }
})
