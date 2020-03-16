import { browser } from 'webextension-polyfill-ts'
// import * as Sentry from '@sentry/browser'

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
          case 'GET_LOCATION': {
            navigator.geolocation.getCurrentPosition(position => {
              browser.tabs.sendMessage(sender.tab.id, {
                event: 'LOCATION',
                data: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                }
              })
            }, err => {
              console.error(err)
              browser.tabs.sendMessage(sender.tab.id, {
                event: 'LOCATION_ERROR'
              })
            }, {
              enableHighAccuracy: false,
              maximumAge: 1000 * 60 * 10
            })
          }
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
  // Sentry.init({ dsn: 'https://74a8d59422b2400388350592195d8150@sentry.io/4929753' })
}
