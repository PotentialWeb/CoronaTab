declare global {
  interface Window {
    dataLayer: any[]
  }
}

export class Google {
  static TAG_MANAGER_ID = 'GTM-5B7KGXD'
  static TAG_MANAGER_IFRAME_ID = 'app-gtm-iframe'

  static async useTagManager () {
    if (!process.env.GTM_ENABLED || document.getElementById(Google.TAG_MANAGER_IFRAME_ID)) return

    let noscript = document.createElement('noscript')
    let iframe = document.createElement('iframe')
    iframe.setAttribute('src', `https://www.googletagmanager.com/ns.html?id=${Google.TAG_MANAGER_ID}`)
    iframe.setAttribute('height', '0px')
    iframe.setAttribute('width', '0px')
    iframe.setAttribute('style', 'display:none;visibility:hidden')
    iframe.setAttribute('id', Google.TAG_MANAGER_IFRAME_ID)
    noscript.appendChild(iframe)
    document.getElementsByTagName('body')[0].appendChild(noscript)

    /* tslint:disable */
    ;(function(w,d,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName('script')[0],
      j=d.createElement('script'),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'dataLayer', Google.TAG_MANAGER_ID);
    /* tslint:enable */
  }

  static pushGTMEvent (name: string, attrs: any = {}) {
    if (typeof window === 'undefined') return
    Google.useTagManager()
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: name,
      ...attrs
    })
  }

  static setGTMData (data: any) {
    if (typeof window === 'undefined') return
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(data)
  }
}
