import { Locale } from '../models/locale'
import { LocaleIds } from '../../../../shared/locales'
import { Types } from '../../../../shared/types'

export const Locales = LocaleIds.map(id => new Locale({
  id,
  name: (() => {
    switch (id) {
      case 'en': return 'English'
      default: Types.unreachable(id)
    }
  })()
}))
