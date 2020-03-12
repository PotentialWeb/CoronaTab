import { BaseEntity, EntityMetadata } from 'typeorm'
import { connection, connect } from './models'
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata'

export class Model<T> extends BaseEntity {
  constructor (config: Omit<T, 'hasId' | 'save' | 'remove' | 'reload' | 'get' | 'metadata' | 'getMetadataInfo'>) {
    super()
    Object.assign(this, config)
  }

  async get? (relations: string[] | string) {
    await connect()
    const { primaryColumns } = this.getMetadataInfo()
    const search = primaryColumns.reduce((where, column) => {
      return {
        ...where,
        [column.propertyName]: this[column.propertyName]
      }
    }, {})
    Object.assign(this, await (this.constructor as typeof BaseEntity).findOne(search, {
      relations: Array.isArray(relations) ? relations : [relations]
    }))
    return this
  }

  getMetadataInfo? () {
    return connection && connection.getMetadata(this.constructor as typeof BaseEntity)
  }

  static get metadata () {
    return connection && connection.getMetadata(this)
  }

  static get primaryKeys () {
    return this.metadata.primaryColumns.map(column => column.propertyName)
  }
}
