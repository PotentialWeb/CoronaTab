const withPlugins = require('next-compose-plugins')
const withOffline = require('next-offline')

module.exports = withPlugins([
  withOffline
], {
  pageExtensions: ['tsx'],
  env: {
    API_HOST: (() => {
      if (process.env.API_HOST) return process.env.API_HOST
      switch (process.env.NODE_ENV) {
        case 'development':
          return 'http://localhost:3000'
        default:
          return 'https://api.coronatab.app'
      }
    })(),
    API_NAMESPACE: process.env.API_NAMESPACE,
    GTM_ENABLED: process.env.GTM_ENABLED === 'true' || process.env.NODE_ENV !== 'development'
  },
  webpack: config => {
    // Import svgs through svgr
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })
    return config
  },
  dontAutoRegisterSw: true,
  workboxOpts: {
    runtimeCaching: [
      {
        urlPattern: /^https*:\/\/[www.]*coronatab\.app?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'asset-cache',
          expiration: {
            maxEntries: 200
          }
        }
      }
    ]
  }
})
