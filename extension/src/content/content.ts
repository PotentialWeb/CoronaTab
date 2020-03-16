
import { browser } from 'webextension-polyfill-ts'

console.time('start')
browser.runtime.sendMessage({
  event: 'GET_LOCATION'
})

let dashboardLoaded = false
const loadDashboard = ({ lat, lng }: { lat?: number, lng?: number } = {}) => {
  if (dashboardLoaded) return
  console.timeEnd('start')

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
    console.log('loading dashboard cuz it took too long')
    loadDashboard()
  }
}, 5000)

browser.runtime.onMessage.addListener(message => {
  switch (message.event) {
    case 'LOCATION': {
      console.log('location is here')
      const { lat, lng } = message.data
      loadDashboard({ lat, lng })
      break
    }
    case 'LOCATION_ERROR': {
      console.log('location errored')
      loadDashboard()
      break
    }
  }
})