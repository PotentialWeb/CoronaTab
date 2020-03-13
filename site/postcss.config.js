module.exports = {
  plugins: [
    'postcss-import',
    'tailwindcss',
    'postcss-nested',
    ['postcss-custom-properties', { preserve: false }],
    'postcss-hexrgba',
    'autoprefixer',
    ...(
      process.env.PURGECSS_ENABLED === 'true' || process.env.NODE_ENV === 'production'
        ? [
          ['@fullhuman/postcss-purgecss', {
            content: [
              './src/**/*.html',
              './src/**/*.tsx',
              './src/**/*.ts'
            ],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
            whistlist: [],
            whitelistPatterns: []
          }]
        ]
        : []
    )
  ]
}
