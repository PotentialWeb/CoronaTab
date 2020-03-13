import { Locale } from '../locale'
import { Types } from '../utils/types'

export const LocaleIds = [
  'en'
] as const

export type LocaleId = typeof LocaleIds[number]

export type LocaleTranslations = {
  [key in LocaleId]: string
}

export const Locales = LocaleIds.map(id => new Locale({
  id,
  name: (() => {
    switch (id) {
      case 'en': return 'English'
      default: Types.unreachable(id)
    }
  })()
}))
