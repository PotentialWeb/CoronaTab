import fetch from 'isomorphic-unfetch'
import qs from 'qs'

export type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'
export interface HTTPOptions extends Omit<RequestInit, 'body'> {
  body?: { [key: string]: any } | string
  query?: { [key: string]: any }
}
export type HTTPRequest = {
  method: HTTPMethod
  url: string
  options?: HTTPOptions
}

export class HTTPError extends Error {
  constructor (public req: HTTPRequest, public res: Response) {
    super()
    this.message = `${res.statusText} (${res.status}) error on ${req.method} request to ${req.url}`
  }
}

export class HTTP {
  static async request (method: HTTPMethod, url: string, options: HTTPOptions = {}) {
    // options.credentials = options.credentials || 'include'
    options.method = options.method || method

    if (options.body && typeof options.body !== 'string') {
      options.body = JSON.stringify(options.body)
    }

    if (options.query) {
      const queryStr = qs.stringify(options.query, {})
      if (queryStr.length) url = `${url}?${queryStr}`
    }

    let res: Response
    try {
      res = await fetch(url, options as any)
    } catch (err) {
      throw new HTTPError({ method, url, options }, {
        statusText: err,
        status: 503
      } as Response)
    }

    if (!res.ok) {
      throw new HTTPError({ method, url, options }, res)
    }

    const data = await res.json()
    return data
  }
}
