import { compile } from '../src/buildtime/compiler'
import { config } from 'dotenv'
config()

;(async () => {
  try {
    await compile()
    console.log('Done')
  } catch (err) {
    console.error(err instanceof Error ? err : new Error(err))
    debugger
    process.exit(1)
  }
})()
