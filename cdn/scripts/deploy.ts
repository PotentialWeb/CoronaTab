import { argv } from 'yargs'
import { deploy } from '../src/buildtime/deployer'
import { config } from 'dotenv'
import { compile } from '../src/buildtime/compiler'
config()

;(async () => {
  try {
    await compile()
    await deploy()
    console.log('Done')
  } catch (err) {
    console.error(err instanceof Error ? err : new Error(err))
    process.exit(1)
  }
})()
