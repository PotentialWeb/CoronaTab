import { useStaticRendering } from 'mobx-react'
import { computed, observable, set, action } from 'mobx'
import { UserAgent } from '../utils/user-agent'
import { IsomorphicUrlInfo } from '../utils/url-info'
import { I18n, TFunction } from 'next-i18next'
import { LocaleId } from '@coronatab/shared'

useStaticRendering(typeof window === 'undefined')

interface AppStoreProps {
  i18n: I18n
  t: TFunction
  locale: LocaleId
  urlInfo: IsomorphicUrlInfo
}

interface AppMeta {
  appName: string,
  strapline: string,
  description: string,
  keywords: string,
  pageTitleDelimiter: string
}

export class AppStore {
  constructor (props: AppStoreProps) {
    set(this, props)
  }

  i18n: I18n
  t: TFunction

  @observable
  locale: LocaleId

  @observable
  userAgent = (() => {
    if (typeof window === 'undefined') return
    return UserAgent.parse(window.navigator.userAgent)
  })()

  @observable
  urlInfo: IsomorphicUrlInfo

  get meta (): AppMeta {
    return {
      appName: 'CoronaTab',
      strapline: this.t('strapline'),
      description: this.t('marketing-text'),
      keywords: (() => {
        const translatedStr = ['coronavirus', 'data-platform', 'dashboard', 'browser-extension', 'cases', 'deaths', 'recovered', 'stats']
          .map(str => this.t(str)).join(', ')
        return `${translatedStr}, COVID-19, COVID19, COVID2019, REST API, localized, i18n`
      })(),
      pageTitleDelimiter: ' - '
    }
  }

  @computed
  get browserExtension (): { name: string, url: string } {
    const browser = this.userAgent?.browser
    if (browser) {
      if (browser.includes('Firefox')) {
        return {
          name: 'Firefox',
          url: 'https://addons.mozilla.org/en-GB/firefox/addon/coronatab/'
        }
      } else if (browser.includes('Edge')) {
        return {
          name: 'Edge',
          url: 'https://microsoftedge.microsoft.com/addons/detail/jkmoagnlaijjdljpablgbefbofojlinm'
        }
      }
    }
    return {
      name: 'Chrome',
      url: 'https://chrome.google.com/webstore/detail/fipekhmgdkpocnpkfonlgbflampgkmlk'
    }
  }

  @action.bound
  buildPageTitle (config?: string | { strapline?: boolean, title?: string }) {
    let segments = [this.meta.appName]
    const title = typeof config === 'string' ? config : config?.title
    if (title) segments = [title, ...segments]
    if (typeof config !== 'string' && config?.strapline) {
      segments.push(this.meta.strapline)
    }
    return segments.join(this.meta.pageTitleDelimiter)
  }
}
