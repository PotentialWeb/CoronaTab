import { PureComponent, RefObject, createRef } from 'react'
import { inject, observer } from 'mobx-react'
import { DashboardPageStore, Place, LoadingStatus } from '../../../../pages/dashboard.store'
import { Feature, Map, View, Overlay } from 'ol'
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
import OverlayPositioning from 'ol/OverlayPositioning'
import { LoadingComponent } from '../../../loading'
import get from 'lodash.get'
import numeral from 'numeral'

const {
  theme: {
    colors: {
      red
    }
  }
} = tailwindConfig

export interface Props {
  onClose?: () => any
  pageStore?: DashboardPageStore
}

export interface State {
  hoveredPlace?: Place
  loadingStatus: LoadingStatus
}

interface TooltipStat {
  label: string
  accessor: string
  formatter: (value: number) => string
}

const LARGE_INT_FORMATTER = (value: number) => numeral(value).format(value >= 1000 ? '0.[0]a' : '0,0')
const PERCENTAGE_FORMATTER = (value: number) => numeral(value).format('0.0%')

const TOOLTIP_STATS: TooltipStat[] = [{
  label: 'Cases',
  accessor: 'latestData.cases',
  formatter: LARGE_INT_FORMATTER
}, {
  label: 'Deaths',
  accessor: 'latestData.deaths',
  formatter: LARGE_INT_FORMATTER
}, {
  label: 'Death Rate',
  accessor: 'latestData.deathRate',
  formatter: PERCENTAGE_FORMATTER
}, {
  label: 'Recovered',
  accessor: 'latestData.recovered',
  formatter: LARGE_INT_FORMATTER
}, {
  label: 'Recovery Rate',
  accessor: 'latestData.recoveryRate',
  formatter: PERCENTAGE_FORMATTER
}]

@inject('pageStore')
@observer
export class DashboardGlobalHeatmapContentComponent extends PureComponent<Props, State> {
  state: State = {
    hoveredPlace: null,
    loadingStatus: LoadingStatus.IS_LOADING
  }

  contentRef: RefObject<HTMLDivElement> = createRef()
  mapRef: RefObject<HTMLDivElement> = createRef()
  mapTooltipRef: RefObject<HTMLDivElement> = createRef()

  map: Map

  componentDidMount () {
    document.addEventListener('click', this.onDocumentClick)
    this.fetchDataAndInitMap()
  }

  fetchDataAndInitMap = async () => {
    const places = await this.fetchData()
    if (places) this.initMap(places)
  }

  fetchData = async () => {
    try {
      this.setState({ loadingStatus: LoadingStatus.IS_LOADING })
      const { data: allPlaces } = await PlaceApi.query({ include: ['children' ]})
      this.setState({ loadingStatus: LoadingStatus.HAS_LOADED })
      return allPlaces as Place[]
    } catch (err) {
      this.setState({ loadingStatus: LoadingStatus.HAS_ERRORED })
    }
  }

  initMap = async (places: Place[]) => {
    const features: Feature[] = places
      .filter(place => !place.children && Array.isArray(place.location?.coordinates))
      .map(place => new Feature({
        id: place.id,
        place: DashboardPageStore.calcPlaceLatestDataComputedValues(place),
        geometry: new Point(transformProjection([place.location.coordinates[0], place.location.coordinates[1]], 'EPSG:4326', 'EPSG:3857')),
        value: place.latestData.cases
      }))

    const maxCases = Math.max(...features.map((feature: Feature) => feature.get('value') as number))

    const featuresCollection = new Collection(features)

    const points = new WebGLPointsLayer({
      source: new VectorSource({
        features: featuresCollection
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
      disableHitDetection: false
    })

    const tiles = new TileLayer({
      source: new XYZ({
        url: 'https://api.mapbox.com/styles/v1/37x/ck8aei53a0zkd1inv3rkg7535/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiMzd4IiwiYSI6ImNqdzljOW1seDI0cGc0OXFyMmljZHY0M3kifQ.6agk0PoRjnclPax3ctVgnQ'
      })
    })

    const tooltip = new Overlay({
      element: this.mapTooltipRef.current,
      offset: [10, 0],
      positioning: OverlayPositioning.TOP_CENTER
    })

    const view = new View({
      center: [0, 0],
      zoom: 3
    })

    this.map = new Map({
      layers: [tiles, points],
      overlays: [tooltip],
      target: this.mapRef.current,
      view
    })

    this.map.on('pointermove', evt => {
      const { pixel } = evt
      const hoveredFeature = this.map.forEachFeatureAtPixel(pixel, feature => feature, {
        hitTolerance: 10
      })
      this.mapRef.current.style.cursor = hoveredFeature ? 'pointer' : 'default'
    })

    this.map.on('singleclick', evt => {
      const { coordinate, pixel } = evt
      const hoveredPlace = this.map.forEachFeatureAtPixel(pixel, feature => feature.get('place'), {
        hitTolerance: 10
      })
      this.setState({ hoveredPlace })
      if (hoveredPlace) {
        tooltip.setPosition(coordinate)
        view.animate({
          center: coordinate,
          duration: 500
        })
      }
    })
  }

  onDocumentClick = (e: MouseEvent) => {
    if (this.state.loadingStatus === LoadingStatus.IS_LOADING) return
    const { current } = this.contentRef
    if (current && !current.contains(e.target as Node)) {
      this.props.onClose?.()
    }
  }

  render () {
    const { hoveredPlace, loadingStatus } = this.state
    return (
      <div
        ref={this.contentRef}
        className="container m-auto"
        style={{ height: '90vh' }}
      >
        <div
          className="relative h-full bg-brand-dark text-white rounded md:mx-6 cursor-default depth-lg overflow-hidden dashboard-spacer-x"
        >
          {
            (() => {
              switch (loadingStatus) {
                case LoadingStatus.HAS_LOADED:
                  return (<>
                    <div ref={this.mapRef} className="absolute inset-0" />
                    <div ref={this.mapTooltipRef} className="map-tooltip rounded-sm bg-white text-brand" style={{ display: hoveredPlace ? '' : 'none', minWidth: '200px' }}>
                      {
                        hoveredPlace
                          ? (
                            <>
                              <div className="flex items-center font-bold text-lg px-2 pt-1">
                                {
                                  hoveredPlace.alpha2code
                                    ? <img src={`/flags/${hoveredPlace.alpha2code.toLowerCase()}.svg`} className="h-line mr-2" />
                                    : ''
                                }
                                <span className="truncate">
                                  {hoveredPlace.name}
                                </span>
                              </div>
                              <ul role="table" aria-label={`${hoveredPlace} Coronavirus stats`} className="pb-2">
                                {(() => {
                                  return TOOLTIP_STATS.map(({ label, accessor, formatter }) => (
                                    <li
                                      role="row"
                                      key={label}
                                      className="flex items-center px-2 py-px text-sm"
                                    >
                                      <div
                                        role="cell"
                                        className="flex-1 truncate"
                                      >
                                        <span>
                                          {label}
                                        </span>
                                      </div>
                                      <div
                                        role="cell"
                                        className="flex-shrink-0 flex justify-end"
                                      >
                                        <span className="font-bold">
                                          {formatter(get(hoveredPlace, accessor))}
                                        </span>
                                      </div>
                                    </li>
                                  ))
                                })()}
                              </ul>
                            </>
                          )
                          : ''
                      }
                    </div>
                  </>)
                case LoadingStatus.IS_LOADING:
                  return (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LoadingComponent className="h-8" />
                    </div>
                  )
                case LoadingStatus.HAS_ERRORED:
                  return (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="font-bold text-lg mb-2">Errored loading map</h2>
                        <button onClick={this.fetchDataAndInitMap} className="btn btn-white rounded px-2 py-1">
                          Retry
                        </button>
                      </div>
                    </div>
                  )
              }
            })()
          }
        </div>
      </div>
    )
  }
}
