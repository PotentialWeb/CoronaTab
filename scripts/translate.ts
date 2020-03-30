import { config as InjectEnvs } from 'dotenv'
InjectEnvs()
import { v2 } from '@google-cloud/translate'
import { LocaleId } from '../modules/shared/dist'

const { Translate: GoogleTranslate } = v2
// Instantiates a client
const credentials = JSON.parse(process.env.GOOGLE_TRANSLATE_SERVICE_ACCOUNT)

const google = new GoogleTranslate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials
})

const translate = async (text: string, to: LocaleId) => {
  const [translation] = await google.translate(text, to)
  return translation
}

;(async () => {
  //
})()
