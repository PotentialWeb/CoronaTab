
import { PlaceData } from '../../'

export const SeededPlaceDatas: PlaceData[] = [
  require('./data.json').map(place => new PlaceData(place))
]
