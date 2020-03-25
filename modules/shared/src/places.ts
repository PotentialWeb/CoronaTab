export interface Place {
  id: string
  name: string
  typeId: string
  parentPlaceId: string
  alpha2code: string
  alpha3code: string
  population: number
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
