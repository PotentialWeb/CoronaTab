import { IncomingMessage } from 'http'
import { Cookies } from './cookies'
import { I18NextCookieKey } from './i18n'

export interface IsomorphicUrlInfo {
  protocol: string
  host: string
  origin: string
  pathname: string
  locale: string
  currentUrl: string
  canonicalUrl: string
}

export class URLInfo {
  static get (req?: IncomingMessage): IsomorphicUrlInfo {
    const host = req ? req.headers.host : window.location.host
    const protocol = /^localhost(:\d+)?$/.test(host) ? 'http:' : 'https:'
    const origin = `${protocol}//${host}`
    const locale = req?.language ?? Cookies.get(I18NextCookieKey)
    const pathname = req?.url ?? window.location.pathname?.replace?.(`/${locale}`, '')
    return {
      protocol,
      host,
      origin,
      pathname,
      locale,
      currentUrl: `${origin}${locale ? `/${locale}` : ``}${pathname}`,
      canonicalUrl: `${origin}${pathname}`
    }
  }
}
