import express from 'express'
import { join } from 'path'
import { parse } from 'url'
import next from 'next'
import nextI18NextMiddleware from 'next-i18next/middleware'
import nextI18next from './utils/i18n'

const app = next({ dev: process.env.NODE_ENV !== 'production' })
const handle = app.getRequestHandler()
const port = process.env.PORT || 3000

;(async () => {
  const server = express()

  await nextI18next.initPromise
  server.use(nextI18NextMiddleware(nextI18next))

  server.get('*', (req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname } = parsedUrl
    // handle GET request to /service-worker.js
    if (pathname === '/service-worker.js') {
      const filePath = join(__dirname, '.next', pathname)
      app.serveStatic(req, res, filePath)
    } else {
      handle(req, res, parsedUrl)
    }
  })

  await server.listen(port)
  console.log(`> Ready on http://localhost:${port}`)
})()
