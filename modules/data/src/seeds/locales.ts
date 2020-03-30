import { Locale } from '../models/locale'
import { LocaleIds, Languages } from '@coronatab/shared'

export const Locales = LocaleIds.map(id => new Locale({
  id,
  name: Languages[id]
}))
