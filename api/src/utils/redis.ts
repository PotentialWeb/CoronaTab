import * as redis from 'redis'

export class Redis {
  static get client () {
    const client = redis.createClient({ url: process.env.REDIS_URL, tls: {} })
    client.on('error', console.error)
    return client
  }
}
