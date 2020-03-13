export const LocaleIds = [
  'en'
] as const

export type LocaleId = typeof LocaleIds[number]

export type LocaleTranslations = {
  [key in LocaleId]: string
}