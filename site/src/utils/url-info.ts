import { IncomingMessage } from 'http'

export interface IsomorphicUrlInfo {
  protocol: string
  host: string
  origin: string
  pathname: string
  currentUrl: string
}

export class URLInfo {
  static get (req?: IncomingMessage): IsomorphicUrlInfo {
    const host = req ? req.headers.host : window.location.host
    const protocol = /^localhost(:\d+)?$/.test(host) ? 'http:' : 'https:'
    const pathname = req ? req.url : window.location.pathname
    const origin = `${protocol}//${host}`
    return {
      protocol,
      host,
      origin,
      pathname,
      currentUrl: `${origin}${pathname}`
    }
  }
}
