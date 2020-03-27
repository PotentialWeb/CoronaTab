import dasherize from 'dasherize'

export class Strings extends String {
  static dasherize (str: string): string {
    // tslint:disable-next-line:ter-no-irregular-whitespace
    return str.replace(/,|\./g, '').replace(/ | /g, '-').toLowerCase()
  }
}
