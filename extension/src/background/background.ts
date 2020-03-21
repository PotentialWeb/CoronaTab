import { browser } from 'webextension-polyfill-ts'
import * as Sentry from '@sentry/browser'

class Background {
  constructor () {
    this.listenToMessages()
    this.openNewTab()
  }

  listenToMessages () {
    // Listen to events from tabs
    browser.runtime.onMessage.addListener((request, sender) => {
      if (request.event) {
        switch (request.event) {
          
        }
      }
    })

    // Listen to extension click event
    browser.browserAction.onClicked.addListener((tab) => {
      this.openNewTab()
    })
  }

  openNewTab () {
    browser.tabs.create({
      active: true
    })
  }

}

const background = new Background()

if (process.env.NODE_ENV === 'production') {
  Sentry.init({ dsn: 'https://74a8d59422b2400388350592195d8150@sentry.io/4929753' })
}
