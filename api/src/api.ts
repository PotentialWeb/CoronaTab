
process.on('uncaughtException', console.error)
import express from 'express'
import cors from 'cors'
import { connect } from '@coronatab/data'
import { places } from './places'
import { config as injectEnvs } from 'dotenv'
injectEnvs()

;(async () => {
  await connect({
    synchronize: true
  })

  const api = express()

  api.use(cors())

  api.get('/', (req, res) => {
    res.send('Hello World')
  })

  api.get('/ping', (req, res) => {
    res.send('pong')
  })

  api.use(places)

  const PORT = process.env.PORT ?? 3000

  api.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
  })
})()
