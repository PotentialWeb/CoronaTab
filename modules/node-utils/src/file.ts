import * as fs from 'fs-extra'
import http from 'axios'
import { Types } from '@coronatab/shared'
import StreamToPromise from 'stream-to-promise'

export type FileDownloadReturn = 'Buffer' | 'Stream'
export class File {
  static async download ({ url, saveTo, return: returnType }: { url: string, saveTo?: string, return: 'Buffer' }): Promise<Buffer>
  static async download ({ url, saveTo, return: returnType }: { url: string, saveTo?: string, return: 'Stream' }): Promise<ReadableStream>
  static async download ({ url, saveTo, return: returnType }: { url: string, saveTo?: string, return: FileDownloadReturn }) {

    const req = await http.get(url, { responseType: `stream` })
    const stream = req.data
    if (saveTo) {
      const dirPath = (() => {
        const parts = saveTo.split('/')
        parts.pop()
        return parts.join('/')
      })()
      await fs.ensureDir(dirPath)
      const writer = fs.createWriteStream(saveTo)
      stream.pipe(writer)
    }

    switch (returnType) {
      case 'Buffer': return StreamToPromise(stream)
      case 'Stream': return stream as ReadableStream
      default: Types.unreachable(returnType)
    }
  }
}
