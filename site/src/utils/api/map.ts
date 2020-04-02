import { Api } from '../api'
import Point from 'ol/geom/Point'

export interface MapEntry {
  id: string
  name: string
  location: {
    type: 'Point',
    coordinates: [ number, number ]
  }
  parentName?: string
  alpha2code?: string
  latestData: {
    date: string
    cases: number
    deaths: number
    recovered: number
  }
}
export class MapApi extends Api {
  static pathForMap = () => `/map`

  static async query (): Promise<MapEntry[]> {
    const url = this.buildURL(MapApi.pathForMap())
    let { data }: {
      data: [
        [
          string,
          string,
          string,
          [number, number],
          string,
          [string, number, number, number]
        ]
      ]
    } = await this.request('GET', url, { query: { compact: true } })

    return data.map(([
      id,
      alpha2code,
      name,
      coordinates,
      parentName,
      [date, cases, deaths, recovered]
    ]) => ({
      id, alpha2code, name,
      location: {
        type: 'Point',
        coordinates
      },
      parentName,
      latestData: {
        date, cases, deaths, recovered
      }
    }))
  }
}
