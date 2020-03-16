import { Locale } from '../models/locale'
import { LocaleIds, Types } from '@coronatab/shared'

export const Locales = LocaleIds.map(id => new Locale({
  id,
  name: (() => {
    switch (id) {
      case 'en': return 'English'
      default: Types.unreachable(id)
    }
  })()
}))
