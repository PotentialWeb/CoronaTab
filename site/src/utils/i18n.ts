import NextI18Next from 'next-i18next'
import { LocaleIds } from '@coronatab/shared'

const NextI18NextInstance = new NextI18Next({
  defaultLanguage: 'en',
  otherLanguages: [...LocaleIds] as string[],
  defaultNS: 'common',
  localePath: 'public/data/locales',
  localeStructure: '{{lng}}/{{ns}}',
  localeSubpaths: [...LocaleIds].reduce((locales, locale) => ({
    ...locales, [locale]: locale
  }), {}),
  strictMode: false
})

export default NextI18NextInstance

/* Optionally, export class methods as named exports */
export const {
  appWithTranslation,
  withTranslation,
  Router,
  Link
} = NextI18NextInstance
