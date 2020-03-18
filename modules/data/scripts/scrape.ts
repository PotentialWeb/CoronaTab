
import generate from '../coronadatascraper/index'

;(async () => {
  await generate(null, {
    findFeatures: true,
    findPopulations: true,
    writeData: true
  } as any)
})().catch(err => {
  console.error(err)
  debugger
  process.exit(1)
})
