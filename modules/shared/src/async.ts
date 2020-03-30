
export class Async {
  static delay (ms: number) {
    return new Promise(r => setTimeout(r, ms))
  }
}
