import { Locale } from '../models/locale'
import { Types } from '../utils/types'

export const LocaleIds = [
  'en-GB'
] as const

export type LocaleId = typeof LocaleIds[number]

export type LocaleTranslations = {
  [key in LocaleId]: string
}

export const Locales = LocaleIds.map(id => new Locale({
  id,
  name: (() => {
    switch (id) {
      case 'en-GB': return 'English'
      default: Types.unreachable(id)
    }
  })()
}))
