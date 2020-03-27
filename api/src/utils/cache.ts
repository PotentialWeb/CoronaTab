import { Redis } from './redis'

export default class Cache {
  static client = Redis.client
  private readonly namespace: string
  constructor (namespace: string) {
    this.namespace = namespace
  }

  async get (key: string): Promise<any> {
    return Cache.get(this.namespace, key)
  }

  async set (key: string, value: any, ttlSeconds?: number): Promise<any> {
    return Cache.set(this.namespace, key, value, ttlSeconds)
  }

  async delete (key: string): Promise<any> {
    return Cache.delete(this.namespace, key)
  }

  static async get (namespace: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.get(`${namespace}:${key}`, (err, value) => {
        if (err) return reject(err)
        if (typeof value === 'string') {
          try {
            const parsedValue = JSON.parse(value)
            value = parsedValue
          } catch (_) { /**/ }
        }
        resolve(value || null)
      })
    })
  }

  static async set (namespace: string, key: string, value: any, ttlSeconds: number = 60 * 60): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof value !== 'string') value = JSON.stringify(value)
      let args = [`${namespace}:${key}`, value]
      if (ttlSeconds) {
        args = [...args, ...(ttlSeconds ? ['EX', ttlSeconds] : [])]
      }
      args.push((err, success) => {
        if (err || !success) return reject(err)
        resolve(success)
      })

      this.client.set(...args as [string, string])
    })
  }

  static async delete (namespace: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.del(`${namespace}:${key}`)
      resolve()
    })
  }
}
