export class Meta {
  static APP_NAME = 'CoronaTab'
  static STRAPLINE = 'Browser extension showing localized Coronavirus statistics & advice every time you open a new tab.'
  static KEYWORDS = 'Coronavirus, COVID2019, browser extension'
  static PAGE_TITLE_DELIMITER = ' - '
  static BASE_PATH = 'https://coronatab.app'

  static buildPageTitle (config?: string | { strapline?: boolean, title?: string }) {
    let segments = [Meta.APP_NAME]
    const title = typeof config === 'string' ? config : config?.title
    if (title) segments = [title, ...segments]
    if (typeof config !== 'string' && config?.strapline) {
      segments.push(Meta.STRAPLINE)
    }
    return segments.join(Meta.PAGE_TITLE_DELIMITER)
  }
}
