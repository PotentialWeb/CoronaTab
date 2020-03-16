import * as Sentry from '@sentry/browser'

Sentry.init({
  dsn: 'https://88f9a6c0d3ca4ff88e462313cf9aeb9b@sentry.io/4940141'
})

import { browser } from 'webextension-polyfill-ts'

browser.runtime.sendMessage({
  event: 'GET_LOCATION'
})

let dashboardLoaded = false
const loadDashboard = ({ lat, lng }: { lat?: number, lng?: number } = {}) => {
  if (dashboardLoaded) return

  dashboardLoaded = true
  const iframe = document.createElement('iframe')
  iframe.className = 'dashboard'
  iframe.id = 'dashboard'
  iframe.allow = 'geolocation'
  const url = new URL(`${process.env.DOMAIN}/dashboard?extention=true`)
  if (lat && lng) {
    url.searchParams.set('lat', lat.toString())
    url.searchParams.set('lng', lng.toString())
  }
  iframe.src = url.href
  document.body.appendChild(iframe)
}

// Load dashboard in case the location never arrived
setTimeout(() => {
  if (!dashboardLoaded) {
    loadDashboard()
  }
}, 5000)

browser.runtime.onMessage.addListener(message => {
  switch (message.event) {
    case 'LOCATION': {
      const { lat, lng } = message.data
      loadDashboard({ lat, lng })
      break
    }
    case 'LOCATION_ERROR': {
      loadDashboard()
      break
    }
  }
})