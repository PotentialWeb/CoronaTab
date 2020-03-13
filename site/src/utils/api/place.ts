import { Api } from '../api'

export type PlaceApiFindAllCountriesQuery = { include?: 'regions' }
export type PlaceApiFindClosestQuery = { lng?: string, lat?: string }

export class PlaceApi extends Api {
  static pathForPlaces = () => `/places`
  static pathForPlace = (id: string) => `${PlaceApi.pathForPlaces()}/${id}`
  static pathForPlaceAdvice = (id: string) => `${PlaceApi.pathForPlace(id)}/advice`
  static pathForCountries = () => `${PlaceApi.pathForPlaces()}/countries`
  static pathForClosestPlace = () => `${PlaceApi.pathForPlaces()}/closest`

  static async findAll () {
    const url = this.buildURL(PlaceApi.pathForPlaces())
    return this.request('GET', url, {})
  }

  static async find (id: string) {
    const url = this.buildURL(PlaceApi.pathForPlace(id))
    return this.request('GET', url, {})
  }

  static async findAdvice (id: string) {
    const url = this.buildURL(PlaceApi.pathForPlaceAdvice(id))
    return this.request('GET', url, {})
  }

  static async findAllCountries (query?: PlaceApiFindAllCountriesQuery) {
    const url = this.buildURL(PlaceApi.pathForCountries())
    return this.request('GET', url, { query })
  }

  // static async findClosest (query?: PlaceApiFindClosestQuery) {
  //   const url = this.buildURL(PlaceApi.pathForCountries())
  //   return this.request('GET', url, { query })
  // }

  static async findClosest (query?: PlaceApiFindClosestQuery) {
    return {
      data: {
        id: 1,
        name: 'United Kingdom',
        code: 'GB',
        typeId: 'country',
        parentPlaceId: 'earth',
        location: {
          type: 'Point',
          coordinates: [1,2]
        }
      }
    }
  }
}
