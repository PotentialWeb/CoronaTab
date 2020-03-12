import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn, JoinColumn } from 'typeorm'
import { Polygon, BBox } from 'geojson'
import { PlaceType } from './place/type'
import { Model } from '../model'
import { PlaceGeometry } from './place/geometry'
import { PlaceTypeId } from '../seeds/places/types'
import { DEFAULT_RADIUS_METERS } from '../constants'

export interface ParentPlaceRef {
  id: string
  name: string
  parentPlaceId: string
}

@Entity()
export class Place extends Model<Place> {
  @PrimaryColumn()
  id: string

  @Column()
  name: string

  @ManyToOne(() => PlaceType)
  type?: PlaceType
  @Column()
  typeId: PlaceTypeId

  @ManyToOne(() => PlaceGeometry, geometry => geometry.place)
  geometry?: PlaceGeometry

  @OneToOne(() => Place)
  parentPlace?: Place
  @Column()
  parentPlaceId: string

  parentPlaces?: ParentPlaceRef[]

  distance?: number

  async getBoundingBox? (): Promise<BBox> {
    let { bbox }: { bbox: string } = await PlaceGeometry.createQueryBuilder('geometry')
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
