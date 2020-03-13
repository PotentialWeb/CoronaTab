module.exports = {
  env: {
    API_HOST: process.env.API_HOST,
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
