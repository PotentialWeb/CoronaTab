
import { PlaceData } from '../../'

export const SeededPlaceDatas: PlaceData[] = require('./place-data.json').map(place => new PlaceData(place))
