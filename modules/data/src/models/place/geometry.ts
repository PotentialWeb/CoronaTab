import { Entity, Column, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm'
import { Model } from '../../model'
import { Geometry } from 'geojson'
import { Place } from '../place'

@Entity()
export class PlaceGeometry extends Model<PlaceGeometry> {
  @OneToOne(() => Place, place => place.geometry, { primary: true, onDelete: 'CASCADE' })
  @JoinColumn()
  place?: Place
  @PrimaryColumn()
  placeId: string

  @Column('geometry')
  geometry: Geometry
}
