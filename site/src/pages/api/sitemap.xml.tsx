import { NextApiRequest, NextApiResponse } from 'next'
import { SitemapStream, streamToPromise, EnumChangefreq } from 'sitemap'
import { createGzip } from 'zlib'
import { URLInfo } from '../../utils/url-info'
import { LocaleIds } from '@coronatab/shared'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!res) return {}

    res.setHeader('content-type', 'application/xml')
    res.setHeader('Content-Encoding', 'gzip')

    const urlInfo = URLInfo.get(req)

    const sitemap = new SitemapStream({
      hostname: urlInfo.origin
    })

    const pipeline = sitemap.pipe(createGzip())

    const localizedUrls = [{
      url: '/', changefreq: EnumChangefreq.WEEKLY, priority: 1,
    }, {
      url: '/dashboard', changefreq: EnumChangefreq.WEEKLY, priority: 1
    }]

    for (const { url, ...config } of localizedUrls) {
      sitemap.write({
        url,
        links: [...LocaleIds].map(locale => ({
          lang: locale,
          url: `/${locale}${url}`
        })),
        ...config
      })

      for (const locale of [...LocaleIds]) {
        sitemap.write({
          url: `/${locale}${url}`,
          links: [...LocaleIds].filter(l => l !== locale).map(locale => ({
            lang: locale,
            url: `/${locale}${url}`
          })),
          ...config
        })
      }
    }

    sitemap.end()
    streamToPromise(pipeline)
    pipeline.pipe(res).on('error', e => { throw e })
  } catch (e) {
    res.status(500).end()
  }
}
