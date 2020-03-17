import { useStaticRendering } from 'mobx-react'
import { computed, observable } from 'mobx'
import { UserAgent } from '../utils/user-agent'
import { Meta } from '../utils/meta'

useStaticRendering(typeof window === 'undefined')

export class AppStore {
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
