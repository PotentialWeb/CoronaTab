
process.on('uncaughtException', console.error)
import { config as injectEnvs } from 'dotenv'
injectEnvs()

import express from 'express'
import cors from 'cors'
import { connect } from '@coronatab/data'
import { places } from './places'
import 'express-async-errors'
import bodyParser from 'body-parser'

;(async () => {
  await connect()

  const api = express()

  api.use(bodyParser.json())

  api.use(cors({
    origin: [
      'http://localhost:8000',
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

  api.use(places)

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
