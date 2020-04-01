const { createServer } = require('http')
const { join } = require('path')
const { parse } = require('url')
const next = require('next')
const nextI18NextMiddleware = require('next-i18next/middleware').default
const nextI18next = require('./src/utils/i18n')

const app = next({ dev: process.env.NODE_ENV !== 'production' })
const handle = app.getRequestHandler()
const port = process.env.PORT || 3000

(async () => {
  const server = createServer((req, res) => {
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

  await nextI18next.initPromise
  server.use(nextI18NextMiddleware(nextI18next))

  server.listen(port, () => console.log(`> Ready on http://localhost:${port}`))
})()
