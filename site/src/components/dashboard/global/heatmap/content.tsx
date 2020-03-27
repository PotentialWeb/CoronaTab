import { Component, RefObject, createRef } from 'react'
import { inject, observer } from 'mobx-react'
import { DashboardPageStore } from '../../../../pages/dashboard.store'
import { Feature, Map, View } from 'ol'
import { Tile as TileLayer } from 'ol/layer'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import XYZ from 'ol/source/XYZ'
import VectorSource from 'ol/source/Vector'
import Collection from 'ol/Collection'
import { SymbolType } from 'ol/style/LiteralStyle'
import Point from 'ol/geom/Point'
import { transform as transformProjection } from 'ol/proj'
import { PlaceApi } from '../../../../utils/api/place'
import tailwindConfig from '../../../../utils/tailwind'

const {
  theme: {
    colors: {
      lighter,
      red
    }
  }
} = tailwindConfig

export interface Props {
  onClose?: () => any
  pageStore?: DashboardPageStore
}

export interface State {
}

@inject('pageStore')
@observer
export class DashboardGlobalHeatmapContentComponent extends Component<Props, State> {
  contentRef: RefObject<HTMLDivElement> = createRef()
  mapRef: RefObject<HTMLDivElement> = createRef()

  map: Map

  componentDidMount () {
    document.addEventListener('click', this.onDocumentClick)
    this.initMap()
  }

  initMap = async () => {
    const { data: allPlaces } = await PlaceApi.query({ include: ['children'] })

    const features = allPlaces
      .filter(place => !place.children && Array.isArray(place.location?.coordinates))
      .map(place => new Feature({
        id: place.id,
        geometry: new Point(transformProjection([place.location.coordinates[0], place.location.coordinates[1]], 'EPSG:4326', 'EPSG:3857')),
        value: place.latestData.cases
      }))

    const maxCases = Math.max(...features.map((feature) => feature.get('value') as number))

    const points = new WebGLPointsLayer({
      source: new VectorSource({
        features: new Collection(features)
      }),
      style: {
        symbol: {
          symbolType: SymbolType.CIRCLE,
          size: [
            'interpolate',
            ['exponential', 0.5],
            ['get', 'value'],
            0, 5,
            maxCases, 64
          ],
          color: [
            'interpolate',
            ['exponential', 0.5],
            ['get', 'value'],
            0, red,
            maxCases, 'red'
          ],
          rotateWithView: false,
          offset: [0, 0],
          opacity: [
            'interpolate',
            ['exponential', 0.5],
            ['get', 'value'],
            0, 0.66,
            maxCases, 0.9
          ]
        }
      },
      disableHitDetection: true
    })

    const tiles = new TileLayer({
      source: new XYZ({
        url: 'https://api.mapbox.com/styles/v1/37x/ck8aei53a0zkd1inv3rkg7535/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiMzd4IiwiYSI6ImNqdzljOW1seDI0cGc0OXFyMmljZHY0M3kifQ.6agk0PoRjnclPax3ctVgnQ'
      })
    })

    this.map = new Map({
      layers: [tiles, points],
      target: this.mapRef.current,
      view: new View({
        center: [0, 0],
        zoom: 3
      })
    })
  }

  onDocumentClick = (e: MouseEvent) => {
    const { current } = this.contentRef
    if (current && !current.contains(e.target as Node)) {
      this.props.onClose?.()
    }
  }

  render () {
    return (
      <div
        ref={this.contentRef}
        className="container m-auto"
        style={{ height: '90vh' }}
      >
        <div
          className="relative h-full bg-white rounded md:mx-6 cursor-default depth-lg overflow-hidden dashboard-spacer-x"
        >
          <div ref={this.mapRef} className="absolute inset-0" />
        </div>
      </div>
    )
  }
}
