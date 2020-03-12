declare global {
  interface Window {
    FB?: any
    fbAsyncInit?: () => any
    fbq: (action: 'track' | 'trackCustom', event: string, data: any) => void
  }
}

export class Facebook {
  static APP_ID = 0 // TODO: Add Facebook app ID

  static async injectPlatform () {
    if (window.FB) return

    window.fbAsyncInit = () => {
      window.FB.init({
        appId: Facebook.APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v3.3'
      })
    }

    await new Promise(resolve => {
      const script = document.createElement('script')
      script.setAttribute('type', 'text/javascript')
      script.onload = resolve
      script.setAttribute('src', 'https://connect.facebook.net/en_US/sdk.js')
      document.getElementsByTagName('head')[0].appendChild(script)
    })
  }

  static trackCustomEvent (event: string, data?: any) {
    if (window?.fbq) {
      window.fbq('trackCustom', event, data)
    }
  }

  static trackEvent (event: string, data?: any) {
    if (window?.fbq) {
      window.fbq('track', event, data)
    }
  }
}
