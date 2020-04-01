import React from 'react'
import NextApp, { AppInitialProps, AppContext } from 'next/app'
import { Provider } from 'mobx-react'
import { AppStore } from './_app.store'
import { withRouter, NextRouter } from 'next/router'
import { WithTranslation } from 'next-i18next'
import { appWithTranslation, withTranslation, I18NextCookieKey } from '../utils/i18n'
import { Cookies } from '../utils/cookies'
import { Google } from '../utils/google'
import { HeadComponent } from '../components/head'
import { URLInfo, IsomorphicUrlInfo } from '../utils/url-info'
import { ServiceWorkerHandler } from '../utils/service-worker'
import { LocaleId } from '@coronatab/shared'
import '../utils/polyfills'
import '../style.css'


interface Props extends AppInitialProps, WithTranslation {
  router: NextRouter,
  locale: LocaleId,
  urlInfo: IsomorphicUrlInfo
}

interface State {
  appStore: AppStore
}

class App extends NextApp<Props, State> {
  static async getInitialProps (appContext: AppContext) {
    const appProps: AppInitialProps = await NextApp.getInitialProps(appContext)
    const locale = Cookies.get(I18NextCookieKey, appContext.ctx)
    const urlInfo = URLInfo.get(appContext.ctx.req)
    return { ...appProps, locale, urlInfo }
  }

  state: State = {
    appStore: new AppStore({
      i18n: this.props.i18n,
      t: this.props.t,
      locale: this.props.locale,
      urlInfo: this.props.urlInfo
    })
  }

  componentDidMount () {
    Google.useTagManager()
    ServiceWorkerHandler.register()
  }

  render () {
    const { Component, pageProps } = this.props
    const { appStore } = this.state
    return (
      <Provider appStore={appStore}>
        <>
          <HeadComponent />
          <Component {...pageProps} />
        </>
      </Provider>
    )
  }
}

export default withRouter(appWithTranslation(withTranslation()(App)))
