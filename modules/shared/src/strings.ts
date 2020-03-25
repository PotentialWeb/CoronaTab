import dasherize from 'dasherize'

export class Strings extends String {
  static dasherize (str: string): string {
    return str.replace(/,|\./g, '').replace(/ /g, '-').toLowerCase()
  }
}
