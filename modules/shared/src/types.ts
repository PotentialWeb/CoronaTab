
export class Types {
  static unreachable = (value: never): never => { throw new Error('Should not have reached over here') }
}
