import { Api } from '../api'

export type DataApiQuery = { placeId: string }

export class DataApi extends Api {
  static pathForData = () => `/data`

  // static async query (query: DataApiQuery) {
  //   const url = this.buildURL(DataApi.pathForData())
  //   return this.request('GET', url, { query })
  // }

  static async query (query: DataApiQuery) {
    return {
      data: [{
        date: '2020/03/01',
        cases: 0,
        deaths: 0,
        recovered: 0
      }, {
        date: '2020/03/02',
        cases: 5,
        deaths: 1,
        recovered: 0
      }, {
        date: '2020/03/03',
        cases: 10,
        deaths: 1,
        recovered: 0
      }, {
        date: '2020/03/04',
        cases: 17,
        deaths: 2,
        recovered: 0
      }, {
        date: '2020/03/05',
        cases: 22,
        deaths: 3,
        recovered: 1
      }]
    }
  }
}
