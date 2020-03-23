export interface Place {
  id: string
  name: string
  code: string
  typeId: string
  parentPlaceId: string
  latestData: {
    cases: number
    deaths: number
    recovered: number
  }
  location: {
    type: string
    coordinates: number[]
  }
  children: Place[]
}
