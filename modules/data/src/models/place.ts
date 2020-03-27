import { Column, Entity, ManyToOne, PrimaryColumn, OneToMany, OneToOne, AfterLoad } from 'typeorm'
import { Polygon, BBox, Point } from 'geojson'
import { Model } from './model'
import { PlaceType } from './place/type'
import { PlacePolygon } from './place/polygon'
import { PlaceTypeId } from '../seeds/places/types'
import { DEFAULT_RADIUS_METERS, LocaleTranslations } from '@coronatab/shared'
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

  @Column('jsonb')
  locales: LocaleTranslations

  name?: string

  @ManyToOne(() => PlaceType)
  type?: PlaceType
  @Column()
  typeId: PlaceTypeId

  @Column({ nullable: true })
  alpha2code?: string

  @Column({ nullable: true })
  code?: string

  @Column({ nullable: true })
  alpha3code?: string

  @Column('int4', { nullable: true })
  hospitalBedOccupancy?: number

  @Column('int4', { nullable: true })
  hospitalBeds?: number

  @Column('int4', { nullable: true })
  icuBeds?: number

  @Column({ nullable: true })
  dataSource?: string

  @Column('geography', {
    nullable: true,
    srid: 4326,
    spatialFeatureType: 'Geometry'
  })
  location?: Point

  @Column({ nullable: true })
  phoneCode?: string

  @Column('int8', { nullable: true })
  population?: number

  @OneToMany(() => PlacePolygon, geometry => geometry.place)
  geometry?: PlacePolygon

  @ManyToOne(() => Place, place => place.parentId, { nullable: true, onDelete: 'SET NULL' })
  parent?: Place
  @Column({ nullable: true })
  parentId?: string

  @OneToMany(() => PlaceData, data => data.place)
  data?: PlaceData[]

  latestData?: PlaceData

  @OneToMany(() => Place, child => child.parentId)
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

  // TODO: Implement
  // static async getParentChain (placeId: string) {
  //   return Place.getRepository().query(`
  //     WITH RECURSIVE Parents (id, name, "typeId", "parentPlaceId", depth) as
  //     (
  //         SELECT id, name, "typeId", "parentPlaceId", 0 as depth
  //         FROM place
  //         WHERE id = '${placeId}'
  //         UNION ALL
  //         SELECT e.id, e.name, e."typeId", e."parentPlaceId", depth + 1
  //         FROM place e
  //         JOIN Parents p
  //         ON e.id = p."parentPlaceId"
  //     )
  //     SELECT id, name, "typeId", "parentPlaceId" from Parents
  //     WHERE id <> '${placeId}'
  //     ORDER BY depth DESC
  //   `)
  // }

  // getParentChain ? = () => Place.getParentChain(this.id)

  static async getLatestData (placeId: string) {
    return PlaceData.findOne({
      where: {
        placeId
      },
      order: {
        date: 'DESC'
      }
    })
  }

  getLatestData ? = async () => {
    this.latestData = this.latestData || await Place.getLatestData(this.id)
    return this.latestData
  }

  static async getChildren (placeId: string) {
    return Place.find({
      where: {
        parentId: placeId
      }
    })
  }

  getChildren ? = async () => {
    this.children = await Place.getChildren(this.id)
    return this.children
  }

  static async getClosest ({ lng, lat, limit }: { lng: number, lat: number, limit?: number }) {
    const query = Place.createQueryBuilder('place')
    .select([
      'place',
      `ST_DistanceSphere(ST_GeomFromText(:point, 4326), location::geometry) as distance`
    ])
    .setParameters({ point: `POINT(${lng} ${lat})` })
    .where('location IS NOT NULL')
    .orderBy('distance', 'ASC')

    if (limit) query.limit(limit)
    const places = await query.getMany()
    return places
  }

}
