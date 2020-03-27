import { Entity, Column, OneToOne, JoinColumn, PrimaryColumn, OneToMany, ManyToOne } from 'typeorm'
import { Model } from '../model'
import type { Polygon, MultiPolygon } from 'geojson'
import { Place } from '../place'

@Entity()
export class PlacePolygon extends Model<PlacePolygon> {
  @ManyToOne(() => Place, place => place.geometry, { primary: true, onDelete: 'CASCADE' })
  place?: Place
  @PrimaryColumn()
  placeId: string

  @Column('geography', {
    srid: 4326,
    spatialFeatureType: 'Geometry'
  })
  polygon: Polygon | MultiPolygon
}
