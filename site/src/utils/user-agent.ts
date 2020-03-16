// Taken from next-useragent
// https://github.com/tokuda109/next-useragent

import { UAParser } from 'ua-parser-js'

export class UserAgent {
  readonly source: string
  readonly deviceType?: string
  readonly deviceVendor?: string
  readonly os: string
  readonly osVersion: number
  readonly browser: string
  readonly browserVersion: number
  readonly isIphone: boolean
  readonly isIpad: boolean
  readonly isMobile: boolean
  readonly isTablet: boolean
  readonly isDesktop: boolean
  readonly isBot: boolean
  readonly isChrome: boolean
  readonly isFirefox: boolean
  readonly isSafari: boolean
  readonly isIE: boolean
  readonly isMac: boolean
  readonly isChromeOS: boolean
  readonly isWindows: boolean
  readonly isIos: boolean
  readonly isAndroid: boolean

  static parse (source: string) {
    const result: IUAParser.IResult = new UAParser(source).getResult()
    const regex = new RegExp(`(${UserAgent.BOT_UA.join('|')})`, 'ig')
    const browser: string = result.browser.name
    const deviceType: string = result.device.type
    const os: string = result.os.name
    const isMobile: boolean = deviceType === 'mobile'
    const isTablet: boolean = deviceType === 'tablet'
    const isIos: boolean = os === 'iOS'
    const ua: UserAgent = Object.freeze({
      browser,
      deviceType,
      os,
      isMobile,
      isTablet,
      isIos,
      source,
      deviceVendor:   result.device.vendor,
      osVersion:      parseInt(result.os.version, 10),
      browserVersion: parseFloat(result.browser.version),
      isIphone:       isMobile && isIos,
      isIpad:         isTablet && isIos,
      isDesktop:      !isMobile && !isTablet,
      isChrome:       browser === 'Chrome',
      isFirefox:      browser === 'Firefox',
      isSafari:       browser === 'Safari',
      isIE:           browser === 'IE',
      isMac:          os === 'Mac OS',
      isChromeOS:     os === 'Chromium OS',
      isWindows:      os === 'Windows',
      isAndroid:      os === 'Android',
      isBot:          regex.test(source.toLowerCase())
    })
    return ua
  }

  static BOT_UA = [
    '\\+https:\\/\\/developers.google.com\\/\\+\\/web\\/snippet\\/',
    'googlebot',
    'baiduspider',
    'gurujibot',
    'yandexbot',
    'slurp',
    'msnbot',
    'bingbot',
    'facebookexternalhit',
    'linkedinbot',
    'twitterbot',
    'slackbot',
    'telegrambot',
    'applebot',
    'pingdom',
    'tumblr'
  ]
}
