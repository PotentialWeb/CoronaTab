export interface Place {
  id: string
  name: string
  code: string
  typeId: string
  parentPlaceId: string
  location: {
    type: string
    coordinates: number[]
  }
  children: Place[]
}
