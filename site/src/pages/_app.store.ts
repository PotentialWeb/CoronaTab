import { useStaticRendering } from 'mobx-react'
import { computed, observable } from 'mobx'
import { UserAgent } from '../utils/user-agent'
import { Meta } from '../utils/meta'
import { I18n, TFunction } from 'next-i18next'
import { LocaleId } from '@coronatab/shared'

interface AppStoreProps {
  i18n: I18n
  t: TFunction
  locale: LocaleId
}

useStaticRendering(typeof window === 'undefined')

export class AppStore {
  constructor (props: AppStoreProps) {
    Object.assign(this, props)
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

  @computed
  get browserExtension (): { name: string, url: string } {
    const browser = this.userAgent?.browser
    if (browser) {
      if (browser.includes('Firefox')) {
        return {
          name: 'Firefox',
          url: Meta.EXTENSION_URL.FIREFOX
        }
      } else if (browser.includes('Edge')) {
        return {
          name: 'Edge',
          url: Meta.EXTENSION_URL.EDGE
        }
      }
    }
    return {
      name: 'Chrome',
      url: Meta.EXTENSION_URL.CHROME
    }
  }
}
