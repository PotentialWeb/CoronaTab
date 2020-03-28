
export class Arrays {
  static chunk <T> (array: T[], size: number): T[][] {
    const { length } = array
    const chunks: T[][] = []

    for (let index = 0; index < length; index += size) {
      const chunk = array.slice(index, index + size)
      chunks.push(chunk)
    }

    return chunks
  }
}
