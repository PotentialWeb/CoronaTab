import * as webpack from 'webpack'
import * as path from 'path'

export interface CompileConfig {
}

export const compile = async (config: CompileConfig = {}) => {
  const workerPath = `./src/runtime/worker.ts`

  const outputPath = path.resolve(__dirname, '../../dist')

  const compiler = webpack({
    mode: 'production',
    entry: workerPath,
    optimization: {
      minimize: false
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: [ '.ts', '.js' ],
      modules: [
        'node_modules'
      ]
    },
    output: {
      filename: `worker.js`,
      path: outputPath
    }
  })

  await new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        console.error(err || stats)
        return reject(err || stats)
      }
      resolve(stats.compilation.errors)
    })
  })
}
