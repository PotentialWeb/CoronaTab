import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn, JoinColumn, ManyToMany, OneToMany } from 'typeorm'
import { Polygon, BBox, Point } from 'geojson'
import { PlaceType } from './place/type'
import { Model } from './model'
import { PlacePolygon } from './place/polygon'
import { PlaceTypeId } from '../seeds/places/types'
import { DEFAULT_RADIUS_METERS } from '../../../../shared/constants'
import { LocaleTranslations } from '../../../../shared/locales'
import { PlaceData } from './place/data'

export interface ParentPlaceRef {
  id: string
  name: string
  parentPlaceId: string
}

@Entity()
export class Place extends Model<Place> {
  @PrimaryColumn()
  id: string

  @Column('json')
  locales: LocaleTranslations

  @ManyToOne(() => PlaceType)
  type?: PlaceType
  @Column()
  typeId: PlaceTypeId

  @Column()
  code: string

  @Column('geography', {
    nullable: true,
    srid: 4326,
    spatialFeatureType: 'Geometry'
  })
  location?: Point

  @OneToMany(() => PlacePolygon, geometry => geometry.place)
  geometry?: PlacePolygon

  @ManyToOne(() => Place, { nullable: true })
  parent?: Place
  @Column({ nullable: true })
  parentId?: string

  @OneToMany(() => PlaceData, data => data.place)
  data?: PlaceData[]

  children?: Place[]

  distance?: number

  async getBoundingBox? (): Promise<BBox> {
    let { bbox }: { bbox: string } = await PlacePolygon.createQueryBuilder('geometry')
      .select(`ST_Extent(ST_Buffer(geometry::geography, ${DEFAULT_RADIUS_METERS})::geometry) as bbox`)
      .where('"placeId" = :id', { id: this.id })
      .getRawOne()
    return bbox.replace(/BOX\((.*)\)/g, '$1').split(/,| /g).map(c => parseFloat(c)) as BBox
  }

  async getBoundingBoxGeoJSON? (): Promise<Polygon> {
    const [ minLon, minLat, maxLon, maxLat ] = await this.getBoundingBox()
    return {
      type: 'Polygon',
      coordinates: [
        [[minLon, minLat], [minLon, maxLat], [maxLon, maxLat], [maxLon, minLat]]
      ]
    }
  }

  static async getParentPlaces (placeId: string) {
    return Place.getRepository().query(`
      WITH RECURSIVE Parents (id, name, "typeId", "parentPlaceId", depth) as
      (
          SELECT id, name, "typeId", "parentPlaceId", 0 as depth
          FROM place
          WHERE id = '${placeId}'
          UNION ALL
          SELECT e.id, e.name, e."typeId", e."parentPlaceId", depth + 1
          FROM place e
          JOIN Parents p
          ON e.id = p."parentPlaceId"
      )
      SELECT id, name, "typeId", "parentPlaceId" from Parents
      WHERE id <> '${placeId}'
      ORDER BY depth DESC
    `)
  }

  getParentPlaces ? = () => Place.getParentPlaces(this.id)

}
