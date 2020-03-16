import 'reflect-metadata'
import { createConnection, Connection } from 'typeorm'
let connection: Connection

interface ConnectOptions {
  url?: string
  synchronize?: boolean
  ssl?: boolean
}

declare global {
  namespace NodeJS {
    interface Global {
      MODELS_CONNECTION: Promise<Connection>
    }
  }
}

const connect = async (opts: ConnectOptions = {}) => {
  let url = opts.url ?? process.env.DB_URL

  global.MODELS_CONNECTION = global.MODELS_CONNECTION || (async () => {
    if (!url || typeof url !== 'string') throw new Error('PostgreSQL Connection URL not provided')
    console.info(`⚠️ Models package is connecting to the database`)

    connection = await createConnection({
      type: 'postgres',
      url,
      ssl: 'ssl' in opts ? opts.ssl : false,
      entities: [
        __dirname + '/models/**/*.ts',
        __dirname + '/models/**/*.js'
      ],
      extra: {
        connectionLimit: 1
      },
      // logging: 'all',
      synchronize: opts.synchronize
    })
    console.info(`⚠️ Database connection established`)

    return connection
  })()
  return global.MODELS_CONNECTION
}

export {
  connect, connection
}

export * from './models/model'
export * from './models/place'
export * from './models/place/polygon'
export * from './models/place/type'
export * from './models/place/data'
export * from './models/locale'

export * from './seeds/locales'
export * from './seeds/places'
export * from './seeds/places/types'
export * from './seeds/places/countries'
