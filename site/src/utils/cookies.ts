import { parseCookies, setCookie, destroyCookie } from 'nookies'

export class Cookies {
  static get (key: string, ctx?: any) {
    const cookies = parseCookies(ctx || {})
    let data: any = cookies[key]
    try { data = JSON.parse(data) } catch { /**/ }
    return data
  }

  static set (key: string, item: any, ctx?: any) {
    setCookie(ctx || {}, key, JSON.stringify(item), {
      path: '/',
      maxAge: 365 * 24 * 60 * 60
    })
  }

  static delete (key: string, ctx?: any) {
    destroyCookie(ctx || {}, key)
  }
}
