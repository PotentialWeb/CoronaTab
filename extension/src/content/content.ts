import * as Sentry from '@sentry/browser'

Sentry.init({
  dsn: 'https://88f9a6c0d3ca4ff88e462313cf9aeb9b@sentry.io/4940141'
})

let dashboardLoaded = false
const loadDashboard = () => {
  if (dashboardLoaded) return

  dashboardLoaded = true
  const iframe = document.createElement('iframe')
  iframe.className = 'dashboard'
  iframe.id = 'dashboard'
  iframe.allow = 'geolocation'
  const url = new URL(`${process.env.DOMAIN}/dashboard?extention=true`)

  iframe.src = url.href
  document.body.appendChild(iframe)
}

loadDashboard()