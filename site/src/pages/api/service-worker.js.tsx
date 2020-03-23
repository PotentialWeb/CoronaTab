import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import { join } from 'path'
import { createGzip } from 'zlib'

/* Couldn't get this working */

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!res) return {}

    res.setHeader('content-type', 'application/javascript')
    res.setHeader('Content-Encoding', 'gzip')
    res.setHeader('service-worker-allowed', '/')

    const filePath = join(process.cwd(), '.next', 'service-worker.js')
    const readStream = fs.createReadStream(filePath)

    readStream
      .on('open', () => readStream.pipe(createGzip()).pipe(res))
      .on('error', e => { throw e })
  } catch (e) {
    res.status(500).end()
  }
}
