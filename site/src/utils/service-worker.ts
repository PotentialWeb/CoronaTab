export class ServiceWorkerHandler {
  static register () {
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
  }
}
