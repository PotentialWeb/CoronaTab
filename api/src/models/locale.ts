import { Entity, PrimaryColumn, Column } from 'typeorm'
import { Model } from '../model'
import { LocaleId } from '../seeds/locales'

@Entity()
export class Locale extends Model<Locale> {
  @PrimaryColumn()
  id: LocaleId

  @Column()
  name: string
}
