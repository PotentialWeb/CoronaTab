import { Api } from '../api'

export type PlaceApiQueryIncludes = 'children'
export type PlaceApiQuery = { typeId: string, include?: PlaceApiQueryIncludes[] }
export type PlaceApiDataQuery = { compact: boolean }
export type PlaceApiFindClosestQuery = { lng?: number, lat?: number, include?: PlaceApiQueryIncludes[] }

export class PlaceApi extends Api {
  static pathForPlaces = () => `/places`
  static pathForPlace = (id: string) => `${PlaceApi.pathForPlaces()}/${id}`
  static pathForPlaceData = (id: string) => `${PlaceApi.pathForPlace(id)}/data`
  static pathForClosestPlace = () => `${PlaceApi.pathForPlaces()}/closest`

  static async query (query?: PlaceApiQuery) {
    const url = this.buildURL(PlaceApi.pathForPlaces())
    return this.request('GET', url, { query })
  }

  // static async query () {
  //   return {
  //     data: [{
  //       id: '1',
  //       name: 'United Kingdom',
  //       code: 'GB',
  //       typeId: 'country',
  //       parentPlaceId: 'earth',
  //       location: {
  //         type: 'Point',
  //         coordinates: [1,2]
  //       }
  //     }, {
  //       id: '2',
  //       name: 'China',
  //       code: 'CN',
  //       typeId: 'country',
  //       parentPlaceId: 'earth',
  //       location: {
  //         type: 'Point',
  //         coordinates: [1,2]
  //       }
  //     }]
  //   }
  // }

  static async find (id: string) {
    const url = this.buildURL(PlaceApi.pathForPlace(id))
    return this.request('GET', url, {})
  }

  static queryData (id: string, query?: PlaceApiDataQuery) {
    const url = this.buildURL(PlaceApi.pathForPlaceData(id))
    return this.request('GET', url, { query })
  }

  // static async queryData (id: string, query?: PlaceApiDataQuery) {
  //   await new Promise(resolve => setTimeout(resolve, 1000))
  //   return {
  //     data: [
  //       ['2020/03/01', 0, 0, 0],
  //       ['2020/03/02', 5, 1, 0],
  //       ['2020/03/03', 10, 1, 0],
  //       ['2020/03/04', 17, 2, 0],
  //       ['2020/03/05', 25, 2, 1]
  //     ]
  //   }
  // }

  static async findClosest (query?: PlaceApiFindClosestQuery) {
    const url = this.buildURL(PlaceApi.pathForClosestPlace())
    return this.request('GET', url, { query })
  }

  // static async findClosest (query?: PlaceApiFindClosestQuery) {
  //   return {
  //     data: {
  //       id: 1,
  //       name: 'United Kingdom',
  //       code: 'GB',
  //       typeId: 'country',
  //       parentPlaceId: 'earth',
  //       location: {
  //         type: 'Point',
  //         coordinates: [1,2]
  //       }
  //     }
  //   }
  // }
}
