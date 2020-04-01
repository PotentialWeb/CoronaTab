import NextI18Next from 'next-i18next'
import { LocaleIds } from '@coronatab/shared'

const NextI18NextInstance = new NextI18Next({
  defaultLanguage: 'en',
  otherLanguages: [...LocaleIds] as string[],
  localePath: 'public/static/locales',
  localeStructure: '{{lng}}'
})

export default NextI18NextInstance

/* Optionally, export class methods as named exports */
export const {
  appWithTranslation,
  withTranslation,
  Router,
  Link
} = NextI18NextInstance
