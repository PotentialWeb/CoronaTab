import { PlaceType } from '../../models/place/type'
import { Types } from '../../utils/types'

export const PlaceTypeIds = [
  'country',
  'region',
  'city'
] as const

export type PlaceTypeId = typeof PlaceTypeIds[number]

export const PlaceTypes: PlaceType[] = PlaceTypeIds.map(id => {
  switch (id) {
    case 'country': {
      return new PlaceType({
        id,
        locales: {
          'en-GB': 'Country'
        }
      })
    }
    case 'region': {
      return new PlaceType({
        id,
        locales: {
          'en-GB': 'Region'
        }
      })
    }
    case 'city': {
      return new PlaceType({
        id,
        locales: {
          'en-GB': 'City'
        }
      })
    }
    default: Types.unreachable(id)
  }
})
