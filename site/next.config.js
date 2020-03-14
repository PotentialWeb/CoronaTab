module.exports = {
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
    API_NAMESPACE: process.env.API_NAMESPACE
  },
  webpack: config => {
    // Import svgs through svgr
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })
    return config
  }
}
