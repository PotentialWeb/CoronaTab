import React from 'react'
import NextApp, { AppInitialProps, AppContext } from 'next/app'
import Head from 'next/head'
import { Provider } from 'mobx-react'
import { AppStore } from './_app.store'
import { WithTranslation } from 'next-i18next'
import { appWithTranslation, withTranslation } from '../utils/i18n'
import { Cookies } from '../utils/cookies'
import { Meta } from '../utils/meta'
import { Facebook } from '../utils/facebook'
import { Google } from '../utils/google'
import { LocaleId } from '@coronatab/shared'
import '../utils/polyfills'
import '../style.css'

interface Props extends AppInitialProps, WithTranslation {
  locale: LocaleId
}

interface State {
  appStore: AppStore
}

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(reg => {
        reg.onupdatefound = () => {
          const installingWorker = reg.installing
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.info('reloading due to service worker change')
              // Preferably, display a message asking the user to reload...
              location.reload()
            }
          }
        }
      })
      .catch(err => console.warn('SW registration failed: ', err))
  })
}

class App extends NextApp<Props, State> {
  static getInitialProps = async (ctx: AppContext) => {
    const appProps: AppInitialProps = await NextApp.getInitialProps(ctx)
    return {
      ...appProps,
      locale: Cookies.get('next-i18next', ctx)
    }
  }

  state: State = (() => {
    const { i18n, t, locale } = this.props
    const appStore = new AppStore({
      i18n,
      t,
      locale
    })
    return { appStore }
  })()

  componentDidMount () {
    Google.useTagManager()
  }

  render () {
    const { Component, pageProps } = this.props
    const buildFaviconPath = (size: number) => `/favicons/favicon-${size}.png`
    const pageTitle = Meta.buildPageTitle({ strapline: true })
    const shareImgUrl = `${Meta.BASE_PATH}/graphics/social-share-card.jpg`
    const currentUrl = `${Meta.BASE_PATH}` // TODO: SSG, get absolute path

    return (
      <Provider appStore={this.state.appStore}>
        <>
          <Head>
            <title>{pageTitle}</title>
            <meta name="description" content={Meta.STRAPLINE} />
            <meta name="keywords" content={Meta.KEYWORDS} />
            <meta name="copyright" content="Copyright" />
            <meta name="author" content="Potential Investments Ltd." />

            <meta name="viewport" content="width=device-width, initial-scale=1" />

            <meta property="og:type" content="website" />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={Meta.DESCRIPTION} />
            <meta property="og:image" content={shareImgUrl} />
            <meta property="og:image:width" content="1200px" />
            <meta property="og:image:height" content="630px" />
            <meta property="og:image:alt" content={Meta.APP_NAME} />
            <meta property="fb:app_id" content={Facebook.APP_ID.toString()} />
            <meta property="og:url" content={currentUrl} />

            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={Meta.STRAPLINE} />
            <meta name="twitter:image" content={shareImgUrl} />

            <meta name="apple-mobile-web-app-title" content={Meta.APP_NAME} />
            <meta name="application-name" content={Meta.APP_NAME} />

            <link rel="canonical" href={currentUrl} />

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
          </Head>

          <Component {...pageProps} />
        </>
      </Provider>
    )
  }
}

export default appWithTranslation(withTranslation()(App))
