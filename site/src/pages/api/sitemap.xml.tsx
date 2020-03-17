import { NextApiRequest, NextApiResponse } from 'next'
import { SitemapStream, streamToPromise, EnumChangefreq } from 'sitemap'
import { createGzip } from 'zlib'
import { Meta } from '../../utils/meta'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!res) return {}

    res.setHeader('content-type', 'application/xml')
    res.setHeader('Content-Encoding', 'gzip')

    const sitemap = new SitemapStream({
      hostname: Meta.BASE_PATH
    })

    const pipeline = sitemap.pipe(createGzip())

    // Add any static entries here
    sitemap.write({ url: '/', changefreq: EnumChangefreq.WEEKLY, priority: 1 })
    sitemap.write({ url: '/dashboard', changefreq: EnumChangefreq.WEEKLY, priority: 1 })

    // Add dynamic entries if needs be, like so:
    // for (const entry of entries) {
    //   sitemap.add({ url: entry.url })
    // }

    sitemap.end()
    streamToPromise(pipeline)
    pipeline.pipe(res).on('error', e => { throw e })
  } catch (e) {
    res.status(500).end()
  }
}
