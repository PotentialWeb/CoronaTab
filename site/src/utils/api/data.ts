import { Api } from '../api'

export type DataApiQuery = { placeId: string }

export class DataApi extends Api {
  static pathForData = () => `/data`

  // static async query (query: DataApiQuery) {
  //   const url = this.buildURL(DataApi.pathForData())
  //   return this.request('GET', url, { query })
  // }

  static async query (query: DataApiQuery) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      data: [
        ['2020/03/01', 0, 0, 0],
        ['2020/03/02', 5, 1, 0],
        ['2020/03/03', 10, 1, 0],
        ['2020/03/04', 17, 2, 0],
        ['2020/03/05', 25, 2, 1]
      ]
    }
  }
}
