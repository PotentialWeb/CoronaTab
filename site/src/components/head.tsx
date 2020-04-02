import NextHead from 'next/head'
import { PureComponent } from 'react'
import { inject, observer } from 'mobx-react'
import { AppStore } from '../pages/_app.store'
import { Facebook } from '../utils/facebook'
import { LocaleIds } from '@coronatab/shared'

interface Props {
  appStore?: AppStore
}

@inject('appStore')
@observer
export class HeadComponent extends PureComponent<Props> {
  render () {
    const { appStore } = this.props
    const { meta, buildPageTitle, urlInfo } = appStore
    const buildFaviconPath = (size: number) => `/favicons/favicon-${size}.png`
    const pageTitle = buildPageTitle({ strapline: true })
    const shareImgUrl = `${urlInfo.origin}/graphics/social-share-card.jpg`

    return (
      <NextHead>
        <title>{pageTitle}</title>
        <meta name="description" content={meta.strapline} />
        <meta name="keywords" content={meta.keywords} />
        <meta name="copyright" content="Potential Investments Ltd." />
        <meta name="author" content="Potential Investments Ltd." />

        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:image" content={shareImgUrl} />
        <meta property="og:image:width" content="1200px" />
        <meta property="og:image:height" content="630px" />
        <meta property="og:image:alt" content={meta.appName} />
        <meta property="fb:app_id" content={Facebook.APP_ID.toString()} />
        <meta property="og:url" content={urlInfo.currentUrl} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={shareImgUrl} />

        <meta name="apple-mobile-web-app-title" content={meta.appName} />
        <meta name="application-name" content={meta.appName} />

        <link rel="canonical" href={urlInfo.canonicalUrl} />

        {/* generics */}
        <link rel="icon" href={buildFaviconPath(32)} sizes="32x32" />
        <link rel="icon" href={buildFaviconPath(128)} sizes="128x128" />
        <link rel="icon" href={buildFaviconPath(192)} sizes="192x192" />
        <link rel="icon" href={buildFaviconPath(228)} sizes="228x228" />

        {/* Android */}
        <link rel="shortcut icon" href={buildFaviconPath(196)} sizes="196x196" />

        {/* iOS */}
        <link rel="apple-touch-icon" href={buildFaviconPath(120)} sizes="120x120" />
        <link rel="apple-touch-icon" href={buildFaviconPath(152)} sizes="152x152" />
        <link rel="apple-touch-icon" href={buildFaviconPath(180)} sizes="180x180" />

        {/* i18n */}
        <link rel="alternate" hrefLang="x-default" href={urlInfo.canonicalUrl} />
        {(() => {
          const localizedCurrentUrl = (locale: string) => `${urlInfo.origin}/${locale}${urlInfo.pathname?.replace?.(`/${locale}`, '')}`
          return [...LocaleIds].map(locale => (
            <link key={locale} rel="alternate" hrefLang={locale} href={localizedCurrentUrl(locale)} />
          ))
        })()}

      </NextHead>
    )
  }
}
