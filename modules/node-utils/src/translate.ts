import { v2 } from '@google-cloud/translate'
import { LocaleId } from '@coronatab/shared'
const { Translate: GoogleTranslate } = v2

export class Translate {
  static async text ({ from, to, text }: { from: LocaleId, to: LocaleId, text: string }) {
    // Instantiates a client
    const credentials = JSON.parse(process.env.GOOGLE_TRANSLATE_SERVICE_ACCOUNT)

    const google = new GoogleTranslate({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials
    })

    const [translation] = await google.translate(text, {
      from,
      to
    })
    return translation
  }
}
