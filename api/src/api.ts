import { config as injectEnvs } from 'dotenv'
injectEnvs()

import express from 'express'
import { connect } from './models'

;(async () => {
  await connect({
    synchronize: true
  })

  const api = express()

  api.get('/', (req, res) => {
    res.send('Hello World')
  })

  api.get('/ping', (req, res) => {
    res.send('pong')
  })

  api.get('/data', (req, res) => {
  //
  })

  const PORT = process.env.PORT ?? 3000

  api.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
  })
})()
