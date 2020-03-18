
process.on('uncaughtException', console.error)
import express from 'express'
import cors from 'cors'
import { connect } from '@coronatab/data'
import { places } from './places'
import 'express-async-errors'
import { config as injectEnvs } from 'dotenv'
injectEnvs()

;(async () => {
  await connect()

  const api = express()

  api.use(cors())

  api.get('/', (req, res) => {
    res.send('Hello World!')
  })

  api.get('/ping', (req, res) => {
    res.send('pong')
  })

  api.use(places)

  api.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (process.env.NODE_ENV === 'development') {
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
