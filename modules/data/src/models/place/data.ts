import { Entity, ManyToOne, PrimaryColumn, Column } from 'typeorm'
import { Model } from '../model'
import { Place } from '../place'

@Entity()
export class PlaceData extends Model<PlaceData> {
  @ManyToOne(() => Place, place => place.data, { primary: true })
  place?: Place
  @PrimaryColumn()
  placeId: string

  @PrimaryColumn('date')
  date: string

  @Column('int')
  cases: number

  @Column('int')
  recovered: number

  @Column('int')
  deaths: number
}
