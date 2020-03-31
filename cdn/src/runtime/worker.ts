import Utilities from '../shared/utils'
import * as matcher from 'matcher'
import { LocaleId, LocaleIds } from '@coronatab/shared'

export interface WorkerConfig {
  protocol?: 'https:' | 'http:'
  www?: 'omit' | 'prepend'
  rewriteSameOriginContentToHttps?: true
  purgeCookies?: boolean
  cache?: {
    enabled: boolean
    ttl?: number
    forceRoutes?: string[]
    ignoreRoutes?: string[]
  }
}

export interface RouteConfig {
  [route: string]: WorkerConfig
}

export class Worker {
  DO_CACHE ({ ttl }: { ttl?: number } = {}): any {
    return {
      cf: {
        cacheEverything: true,
        cacheTtl: ttl ?? 60 * 60
      }
    }
  }

  DO_NOT_CACHE (): any {
    return {
      cf: { cacheEverything: false }
    }
  }

  get forbiddenResponse () {
    return new Response('Go Away', {
      status: 403
    })
  }

  constructor (protected configs: RouteConfig) {
    console.log(`Configs: `, this.configs)
    this.setup()
  }

  getConfigForReq (req: Request) {
    return this.getConfigForURL(new URL(req.url))
  }

  getConfigForURL (url: URL) {
    const routes = Object.keys(this.configs)
    const route = routes.find(route => matcher.isMatch(url.href, route))
    return this.configs[route]
  }

  setup () {
    this.setupEventListener()
  }

  setupEventListener () {
    if (typeof addEventListener !== 'function') return
    addEventListener('fetch', (e: FetchEvent) => this.handleEvent(e))
  }

  handleEvent (event: FetchEvent) {
    console.log(`Event: `, event)
    event.respondWith(this.getResponse(event.request))
  }

  async getResponse (req: Request) {
    console.log(`Request: `, req)

    const redirectResponse = await this.getRedirectResponse(req)
    if (redirectResponse) return redirectResponse

    // Cookies
    if (this.shouldPurgeCookies(req)) {
      console.log(`Purging cookies from request`)
      req = Utilities.deleteRequestHeader(req, 'cookie')
    }

    // Fetch Response from Origin
    let cache = this.shouldCache(req)
    console.log(`Will be caching: ${cache}`)

    if (matcher.isMatch(req.url, ['*api.coronatab.app/*'])) {
      // Set locale query string parameter
      const normalize = (l: LocaleId) => l?.split(';')[0].split(',')[0].split('-')[0] as LocaleId
      const valid = l => !!l && LocaleIds.includes(l as LocaleId)

      let locale: LocaleId = normalize(new URL(req.url).searchParams.get('locale') as LocaleId)
      if (!valid(locale)) {
        locale = normalize(req.headers.get('content-language') as LocaleId)
        console.log('Content-Language: ', req.headers.get('content-language'))
        if (!valid(locale)) {
          locale = normalize(req.headers.get('accept-language') as LocaleId)
          console.log('Accept-Language: ', req.headers.get('accept-language'))
          if (!valid(locale)) {
            locale = 'en'
          }
        }
      }
      console.log(`Locale: ${locale}`)
      req = Utilities.addParamToRequestUrl(req, 'locale', locale)
    }

    const config = this.getConfigForReq(req)
    let res = await fetch(req, cache ? this.DO_CACHE({
      ttl: config.cache?.ttl
    }) : this.DO_NOT_CACHE())

    // Force HTTPS
    if (this.shouldRewriteSameOriginContentToHttps(req, res)) {
      console.log(`Rewriting same Origin urls to HTTPS`)
      res = await this.rewriteSameOriginContentToHttps(req, res)
    }

    // Purge response Cookies
    if (this.shouldPurgeCookies(req)) {
      console.log(`Purging Cookies from response`)
      res = Utilities.deleteResponseHeader(res, 'Set-Cookie')
    }

    if (!cache) res = Utilities.setHeader(res, 'cache-control', 'no-cache')

    return res
  }

  async getRedirectResponse (req: Request): Promise<Response> {
    // WWW & HTTPS
    const redirectUrl = this.getRedirectUrl(req)
    if (redirectUrl) {
      console.log(`Redirecting to ${redirectUrl}`)
      return this.createRedirectResponse(redirectUrl)
    }
  }

  async getQueryParams (req: Request): Promise<{ [key: string]: string }> {
    const country = Utilities.getCountry(req)
    const device = Utilities.getDevice(req)
    const source = Utilities.getUtmSource(req)
    return { country, device, utm_source: source }
  }

  getRedirectUrl (req: Request) {
    const url = new URL(req.url)
    const config = this.getConfigForURL(url)
    let redirect = false

    // WWW Rewrite
    switch (config.www) {
      case 'omit': {
        if (url.host.indexOf('www.') === 0) {
          url.host = url.host.replace('www.', '')
          redirect = true
        }
        break
      }
      case 'prepend': {
        if (url.host.indexOf('www.') !== 0) {
          url.host = `www.${url.host}`
          redirect = true
        }
        break
      }
    }

    // Protocol Rewrite
    if (this.shouldRewriteProtocol(req)) {
      url.protocol = config.protocol
      redirect = true
    }

    return redirect ? url : null
  }

  shouldRewriteProtocol (req: Request) {
    const url = new URL(req.url)
    const config = this.getConfigForURL(url)
    return config.protocol && url.protocol !== config.protocol
  }

  createRedirectResponse (url: URL | string) {
    const headers = new Headers()
    headers.set('Location', url.toString())
    return new Response(null, {
      headers,
      status: 301
    })
  }

  shouldPurgeCookies (req: Request) {
    const url = new URL(req.url)
    const config = this.getConfigForURL(url)
    return !!config.purgeCookies
  }

  shouldCache (req: Request) {
    const url = new URL(req.url)
    const config = this.getConfigForURL(url)
    let {
      ignoreRoutes,
      enabled: shouldCache,
      forceRoutes
    } = config.cache

    if (shouldCache && ignoreRoutes && ignoreRoutes.length) {
      shouldCache = !ignoreRoutes.some(route => matcher.isMatch(req.url.toString(), route))
    } else if (!shouldCache && forceRoutes && forceRoutes.length) {
      shouldCache = forceRoutes.some(route => matcher.isMatch(req.url.toString(), route))
    }
    return shouldCache
  }

  shouldRewriteSameOriginContentToHttps (req: Request, res: Response) {
    const url = new URL(req.url)
    const config = this.getConfigForURL(url)
    if (url.protocol === 'https:' && config.rewriteSameOriginContentToHttps) {
      return this.responseIsText(req, res)
    }
    return false
  }

  responseIsText (req: Request, res: Response) {
    const ext = new URL(req.url).href.split('?')[0].split('.').pop()
    const contentType = res.headers.get('Content-Type')
    return contentType && contentType.toLowerCase().includes('charset=utf-8') || ['html', 'js', 'css', 'php'].includes(ext)
  }

  async rewriteSameOriginContentToHttps (req: Request, res: Response) {
    const url = new URL(req.url)
    let text = await res.text()
    text = text
        .replace(new RegExp(`http://${url.host}`, 'g'), `https://${url.host}`)
        .replace(new RegExp(`http:\\\\/\\\\/${url.host}`, 'g'), `https:\\/\\/${url.host}`)
        .replace(new RegExp(`http%3A%2F%2F${url.host}`, 'g'), `https%3A%2F%2F${url.host}`)

    res = new Response(text, res)
    return res
  }

}

new Worker({
  '*api.coronatab.app/*': {
    protocol: 'https:',
    cache: {
      enabled: true,
      ignoreRoutes: [
        '*/places/closest*'
      ]
    }
  },
  '*coronatab.app/*': {
    www: 'omit',
    protocol: 'https:',
    cache: {
      enabled: true
    }
  }
})
