import { config as InjectEnvs } from 'dotenv'
InjectEnvs()
import { v2 } from '@google-cloud/translate'
import { LocaleId, Strings } from '@coronatab/shared'
import { SeededPlaceDatas, SavePlaceDatas } from '../src/seeds/places/data'
import { SavePlaceSeedData, SavePlacePolygons, RegionsData } from '../src'
const { Translate: GoogleTranslate } = v2
// Instantiates a client
const credentials = JSON.parse(process.env.GOOGLE_TRANSLATE_SERVICE_ACCOUNT)

const google = new GoogleTranslate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials
})

const translate = async (text: string, to: LocaleId) => {
  const [translation] = await google.translate(text, {
    from: 'ru',
    to
  })
  return translation
}

;(async () => {
  const regions = RegionsData
  const russianRegions = regions.filter(r => r.id.indexOf('russia-') === 0)
  const data = SeededPlaceDatas
  const polygons = require('../src/seeds/places/regions/polygons.json')

  for (const region of russianRegions) {
    const en = await translate(region.locales.ru, 'en')
    const oldId = region.id
    const newId = `russia-${Strings.dasherize(en)}`
    region.id = newId
    region.locales.en = en
    if (polygons[oldId]) {
      polygons[newId] = polygons[oldId]
      delete polygons[oldId]
    }
    data.filter(d => d.placeId === oldId).forEach(d => {
      d.placeId = newId
    })
  }

  await SavePlaceSeedData({
    data: regions,
    typeId: 'region'
  })

  await SavePlaceDatas({ datas: data })

  await SavePlacePolygons({
    polygons,
    typeId: 'region'
  })
})()
