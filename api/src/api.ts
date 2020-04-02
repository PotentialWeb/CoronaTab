
process.on('uncaughtException', console.error)
import { config as injectEnvs } from 'dotenv'
injectEnvs()

import express from 'express'
import cors from 'cors'
import { connect } from '@coronatab/data'
import { places } from './places'
import 'express-async-errors'
import bodyParser from 'body-parser'
import { LocaleId, LocaleIds } from '@coronatab/shared'
import { map } from './map'

export interface CoronaTabRequest extends express.Request {
  locale: LocaleId
}

(async () => {
  await connect()

  const api = express()

  api.use(bodyParser.json())

  api.use(cors({
    origin: [
      'http://localhost:8080',
      'https://staging.coronatab.app',
      'https://coronatab.app'
    ]
  }))

  api.get('/', (req, res) => {
    res.send('Hello World!')
  })

  api.get('/ping', (req, res) => {
    res.send('pong')
  })

  api.use((req: CoronaTabRequest, res, next) => {
    const normalize = (l: LocaleId) => l?.split(';')[0].split(',')[0].split('-')[0] as LocaleId
    const valid = l => !!l && LocaleIds.includes(l as LocaleId)

    let locale: LocaleId = normalize(req.query.locale)
    if (!valid(locale)) {
      locale = normalize(req.headers['content-language'] as LocaleId)
      if (!valid(locale)) {
        locale = normalize(req.headers['accept-language'] as LocaleId)
        if (!valid(locale)) {
          locale = 'en'
        }
      }
    }

    req.locale = locale
    next()
  })

  api.use('/places', places)
  api.use('/map', map)

  api.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(err)
      res.status(500).json({
        error: err
      })
    } else {
      console.error(err)
      res.status(500).json({
        error: 'Something went wront. Please try again later'
      })
    }

  })

  const PORT = process.env.PORT ?? 3000

  api.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
  })
})().catch(err => console.error(err))
