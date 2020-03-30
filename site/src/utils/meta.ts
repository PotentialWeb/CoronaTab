export class Meta {
  static APP_NAME = 'CoronaTab'
  static STRAPLINE = 'Free & open source platform for COVID-19 data'
  static DESCRIPTION = 'Open source platform for COVID19 data. Advanced dashboard with browser extension and free detailed REST API, localized into all languages.'
  static KEYWORDS = 'Coronavirus, dashboard, browser extension, open source, platform, COVID19, COVID-19, COVID2019, API, REST API, localized, i18n, countries, data'
  static PAGE_TITLE_DELIMITER = ' - '
  static BASE_PATH = 'https://coronatab.app'
  static EXTENSION_URL = {
    CHROME: 'https://chrome.google.com/webstore/detail/fipekhmgdkpocnpkfonlgbflampgkmlk',
    FIREFOX: 'https://addons.mozilla.org/en-GB/firefox/addon/coronatab/',
    EDGE: 'https://microsoftedge.microsoft.com/addons/detail/jkmoagnlaijjdljpablgbefbofojlinm'
  }
  static FACEBOOK_APP_ID = '' // TODO: Add this

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
