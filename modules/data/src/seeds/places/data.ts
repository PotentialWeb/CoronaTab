
import { PlaceData } from '../../'
import * as fs from 'fs-extra'
import * as path from 'path'

export const SavePlaceDatas = async ({ datas }: { datas: PlaceData[] }) => {
  const dataPath = path.resolve(__dirname, '../src/seeds/places/place-data.json')

  await fs.writeFile(dataPath, `
[
  ${datas
      .filter(data => data && data.cases)
      .map(data => `{
    "placeId": "${data.placeId}",
    "date": "${data.date}",
    "cases": ${Math.round(data.cases)},
    "deaths": ${Math.round(data.deaths)},
    "recovered": ${Math.round(data.recovered)}
  }`).join(',\n  ')}
]
  `)
}
export const SeededPlaceDatas: PlaceData[] = require('./place-data.json').map(place => new PlaceData(place))
