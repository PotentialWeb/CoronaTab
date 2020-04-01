import { config as InjectEnvs } from 'dotenv'
InjectEnvs()
import { v2 } from '@google-cloud/translate'
import { LocaleId, LocaleIds, Strings } from '../modules/shared'
import fs from 'fs-extra'
import path from 'path'
import type { PlaceSeedData } from '../modules/data/dist'
import { Async } from '../modules/shared/src/async'
import { SavePlaceSeedData } from '../modules/data/src'
const { Translate: GoogleTranslate } = v2
// Instantiates a client
const credentials = JSON.parse(process.env.GOOGLE_TRANSLATE_SERVICE_ACCOUNT)

const google = new GoogleTranslate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials
})

const translate = async (text: string, to: LocaleId) => {
  const [translation] = await google.translate(text, {
    from: 'en',
    to
  })
  return translation
}

;(async () => {
  // Countries
  const countriesPath = path.resolve(__dirname, '../modules/data/src/seeds/places/countries/data.json')
  const countries: PlaceSeedData[] = require(countriesPath)

  let changedCountriesFile = false
  for (const country of countries) {
    // Add all missing locales
    const presentLocales = Object.keys(country.locales)
    const missingLocales = LocaleIds.filter(locale => !presentLocales.includes(locale))
    for (const locale of missingLocales) {
      const name = await translate(country.locales.en, locale)
      country.locales[locale] = Strings.capitalize(name)
      changedCountriesFile = true
    }
  }

  if (changedCountriesFile) {
    await SavePlaceSeedData({
      data: countries,
      typeId: 'country'
    })
  }

  // Regions
  const regionsPath = path.resolve(__dirname, '../modules/data/src/seeds/places/regions/data.json')
  const regions: PlaceSeedData[] = require(regionsPath)

  let changedRegionsFile = false
  for (const region of regions) {
    // Add all missing locales
    const presentLocales = Object.keys(region.locales)
    const missingLocales = LocaleIds.filter(locale => !presentLocales.includes(locale))
    if (missingLocales.length) {
      let success = false
      while (!success) {
        try {
          await Promise.all(missingLocales.map(async (locale) => {
            const name = await translate(region.locales.en, locale)
            region.locales[locale] = Strings.capitalize(name)
            changedRegionsFile = true
          }))
          success = true
        } catch (err) {
          console.error(err)
          console.error('Failed to translate, waiting for a minue')
          await Async.delay(1000 * 60)
        }
      }

      console.log(`${regions.indexOf(region)}/${regions.length}`)
    }
  }

  if (changedRegionsFile) {
    await SavePlaceSeedData({
      data: regions,
      typeId: 'region'
    })
  }

  // Cities
  const citiesPath = path.resolve(__dirname, '../modules/data/src/seeds/places/cities/data.json')
  const cities: PlaceSeedData[] = require(citiesPath)

  let changedCitiesFile = false
  for (const city of cities) {
    // Add all missing locales
    const presentLocales = Object.keys(city.locales)
    const missingLocales = LocaleIds.filter(locale => !presentLocales.includes(locale))
    if (missingLocales.length) {
      let success = false
      while (!success) {
        try {
          await Promise.all(missingLocales.map(async (locale) => {
            const name = await translate(city.locales.en, locale)
            city.locales[locale] = Strings.capitalize(name)
            changedCitiesFile = true
          }))
          success = true
        } catch (err) {
          console.error(err)
          console.error('Failed to translate, waiting for a minue')
          if (changedCitiesFile) {
            SavePlaceSeedData({
              data: cities,
              typeId: 'city'
            })
          }
          await Async.delay(1000 * 60)
        }
      }

      console.log(`${cities.indexOf(city)}/${cities.length}`)
    }
  }

  if (changedCitiesFile) {
    await SavePlaceSeedData({
      data: cities,
      typeId: 'city'
    })
  }

  // Site
  // const en: { [key: string]: string } = require('../site/public/data/locales/en/common.json')

  // for (const locale of LocaleIds) {
  //   if (locale === 'en') continue
  //   const localePath = path.resolve(__dirname, `../site/public/data/locales/${locale}/common.json`)
  //   const strings: { [key: string]: string } = fs.existsSync(localePath) ? require(localePath) : {}

  //   for (const [key, text] of Object.entries(en)) {
  //     if (!strings.hasOwnProperty(key)) {
  //       const translation = await translate(text, locale)
  //       strings[key] = Strings.capitalize(translation)
  //     }
  //   }

  //   await fs.writeFile(localePath, JSON.stringify(strings, null, 2))
  //   console.log(`Translated: ${locale}`)
  // }

})()
