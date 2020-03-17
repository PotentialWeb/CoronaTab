import { LocaleId, LocaleIds } from '@coronatab/shared'
import * as express from 'express'
import * as geoip from 'geoip-lite'

export class Request {
  static getLocale (req: express.Request): LocaleId {
    let acceptLanguage = req.headers['accept-language']
    if (!acceptLanguage) return 'en'
    acceptLanguage = acceptLanguage.split('-')[0]
    if (LocaleIds.includes(acceptLanguage as LocaleId)) return acceptLanguage as LocaleId
    return 'en'
  }

  static getIP (req: express.Request) {
    const ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      (req.socket ? req.socket.remoteAddress : null)
    return typeof ip === 'string' ? ip.split(',')[0] : ip[0]
  }

  static getGeo (req: express.Request) {
    const ip = this.getIP(req)
    return geoip.lookup(ip)
  }

}
