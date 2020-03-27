import { Component, RefObject, createRef } from 'react'
import { inject, observer } from 'mobx-react'
import { DashboardPageStore } from '../../../../pages/dashboard.store'
import { Feature, Map, View } from 'ol'
import { Heatmap as HeatmapLayer, Tile as TileLayer } from 'ol/layer'
import Stamen from 'ol/source/Stamen'
import VectorSource from 'ol/source/Vector'
import Collection from 'ol/Collection'
import Point from 'ol/geom/Point'
import { transform as transformProjection } from 'ol/proj'
import { PlaceApi } from '../../../../utils/api/place'

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

  const heatmap = new HeatmapLayer({
    source: new VectorSource({
      features: new Collection(features)
    }),
    blur: 5,
    radius: 3,
    weight: (feature) => 0.8 + ((feature.get('value') / maxCases) * 0.2)
  })

  const tiles = new TileLayer({
    source: new Stamen({
      layer: 'terrain-background'
    })
  })

  this.map = new Map({
    layers: [tiles, heatmap],
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
        style={{ height: '90vh', maxWidth: '1280px' }}
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
