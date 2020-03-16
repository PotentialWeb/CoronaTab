import path from 'path'
import webpack from 'webpack'
import CopyPlugin from 'copy-webpack-plugin'
import glob from 'glob'

const config: webpack.Configuration = {
  mode: 'development',
  devtool: process.env.CORONATAB_ENVIRONMENT === 'LOCAL' ? 'inline-source-map' : false,
  optimization: {
    minimize: false
  },
  node: false, // This is needed to avoid use of eval() in the bundle
  entry: {
    background: './src/background/background.ts',
    ...{ ...(process.env.NODE_ENV === 'development' && { ['hot-reload']: './src/background/hot-reload.ts' }) },
    ...glob.sync('./src/content/**/*.ts').reduce((scripts, script) => {
      const path = script.replace('.ts', '').replace('./src/', '')
      return { ...scripts, [path]: script }
    }, {})
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'DOMAIN': JSON.stringify((() => {
          switch (process.env.CORONATAB_ENVIRONMENT) {
            case ('LOCAL'):
              return 'https://localhost:8080'
            case ('STAGING'):
              return 'https://staging.coronatab.app'
            default:
              return 'https://coronatab.app'
          }
        })()),
        'NODE_ENV': `"${process.env.NODE_ENV}"`
      }
    }),
    new CopyPlugin([
      {
        from: './src/manifest.json',
        to: './manifest.json',
        transform: (content) => {
          const manifest = JSON.parse(content)

          if (process.env.NODE_ENV === 'development') {
            manifest.background.scripts.push('hot-reload.js')
          }

          return JSON.stringify(manifest, null, 2)
        }
      },
      {
        from: './src/dashboard.html',
        to: 'dashboard.html'
      },
      {
        from: './src/styles.css',
        to: 'styles.css'
      },
      {
        from: './src/assets/',
        to: './assets/'
      }
    ])
  ],
  resolve: {
    extensions: ['.ts', '.js']
  }
}

export default config
