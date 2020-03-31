import { DEVICE_TESTS } from '../runtime/devices'

export default class Utilities {
  static stringContainsAny (str: string, of: string[]): boolean {
    return of.some(s => str.includes(s))
  }

  static delay (ms: number) {
    return new Promise(r => setTimeout(r, ms))
  }

  static getCurrentMicroTime () {
    return new Date().getTime() * 1000
  }

  static getIPFromRequest (req: Request) {
    return req.headers.get('cf-connecting-ip')
  }

  static getCountryFromRequest (req: Request) {
    return req.headers.get('cf-ipcountry')
  }

  static getCountry (req: Request) {
    const url = new URL(req.url)
    const country = url.searchParams.get('country') || this.getCookie(req, 'country') || Utilities.getCountryFromRequest(req) || 'UN'
    return country
  }

  static getDevice (req: Request) {
    const url = new URL(req.url)
    let device = url.searchParams.get('device')
    if (!device) {
      if (req.headers.get('user-agent')) {
        device = this.getDeviceFromUserAgent(req.headers.get('user-agent')) || 'desktop'
      } else {
        device = this.getCookie(req, 'device') || 'desktop'
      }
    }
    return device
  }

  static getUtmSource (req: Request) {
    const url = new URL(req.url)
    console.log(url)
    return url.searchParams.get('utm_source') || this.getCookie(req, 'utm_source') || 'organic'
  }

  static addParamToRequestUrl (req: Request, param: string, value: string) {
    const url = new URL(req.url)
    url.searchParams.set(param, value)
    return new Request(url.toString(), req)
  }

  static getCookie (req: Request, name: string): string {
    let cookies = this.getCookies(req)
    cookies = `; ${cookies}`
    const parts = cookies.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
  }

  static getCookies (req: Request) {
    return req.headers.get('cookie')
  }

  static setCookie (res: Response, name: string, value: string) {
    const cookie = `${name}=${value || ''}; path=/`
    return this.setHeader(res, 'Set-Cookie', cookie)
  }

  static setHeader (res: Response, name: string, value: string) {
    res = new Response(res.body, res)
    res.headers.set(name, value)
    return res
  }

  static getDeviceFromUserAgent (userAgent: string) {
    for (const device of Object.keys(DEVICE_TESTS)) {
      const tests = DEVICE_TESTS[device]
      const mathes = tests.some(regex => regex.test(userAgent))
      if (mathes) return device
    }
    return null
  }

  static deleteRequestHeader (req: Request, header: string) {
    req = new Request(req.url, req)
    req.headers.delete(header)
    return req
  }

  static deleteResponseHeader (res: Request | Response, header: string) {
    res = new Response(res.body, res)
    res.headers.delete(header)
    return res
  }

  static responseIsHtml (res: Response) {
    const contentType = res.headers.get('Content-Type')
    return contentType ? contentType.toLowerCase().includes('text/html') : false
  }
}
