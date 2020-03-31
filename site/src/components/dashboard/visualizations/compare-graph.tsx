import { PureComponent } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Legend, Bar, ReferenceArea } from 'recharts'
import { scaleLog, scaleLinear } from 'd3-scale'
import tailwindConfig from '../../../utils/tailwind'
import moment from 'moment'
import capitalize from 'lodash.capitalize'
import numeral from 'numeral'
import CloseSvg from '../../../../public/icons/close.svg'
import { LoadingComponent } from '../../loading'
import { Place, LoadingStatus, DashboardPageStore } from '../../../pages/dashboard.store'
import { TypeaheadSelectInputComponent } from '../../inputs/select/typeahead'
import { SelectInputComponent } from '../../inputs/select'
import { ZoomableGraphState } from './cumulative-graph'
import { observer, inject } from 'mobx-react'

const {
  theme: {
    colors: {
      red,
      green,
      brand,
      'brand-dull': brandDull
    }
  }
} = tailwindConfig

interface Props {
  data: any
  places: Place[]
  selectedPlace: Place
  pageStore?: DashboardPageStore
}

enum GraphType {
  CASES = 'cases',
  DEATHS = 'deaths',
  RECOVERED = 'recovered'
}

enum YAxisScaleType {
  LINEAR = 'linear',
  LOGARITHMIC = 'logarithmic'
}

type selectedPlace = { index: number, place: Place }

interface State extends ZoomableGraphState {
  mergedData?: any[]
  selectedPlaces?: selectedPlace[]
  graphType?: GraphType
  yAxisScaleType?: YAxisScaleType
  loadingStatus?: LoadingStatus
}

@inject('pageStore')
@observer
export class DashboardCompareGraphComponent extends PureComponent<Props, State> {
  state: State = {
    ...this.defaultState,
    mergedData: DashboardPageStore.mergeCumulativeSeriesDatas({
      [this.props.selectedPlace.id]: this.props.data
    }),
    selectedPlaces: [],
    graphType: GraphType.CASES,
    yAxisScaleType: YAxisScaleType.LINEAR,
    loadingStatus: LoadingStatus.IS_IDLE
  }

  get defaultState (): State {
    return {
      top: 'dataMax',
      bottom: 'dataMin',
      left: 'dataMin',
      right: 'dataMax',
      startDate: null,
      endDate: null,
      selectedStartDate: null,
      selectedEndDate: null,
      zoomEnabled: true
    }
  }

  mergeCumulativeSeriesDatas = () => {
    let obj = {}
    for (const placeId of [ this.props.selectedPlace.id, ...this.state.selectedPlaces.map(({ place }) => place.id) ]) {
      const { data: rawData } = this.props.pageStore.rawPlaceData?.[placeId]
      if (rawData) obj[placeId] = DashboardPageStore.parseCumulativeSeriesData(rawData)
    }
    return DashboardPageStore.mergeCumulativeSeriesDatas(obj)
  }

  fetchAndMergeData = async (place: Place) => {
    try {
      this.setState({ loadingStatus: LoadingStatus.IS_LOADING })
      await this.props.pageStore.fetchRawPlaceData(place.id)
      const mergedData = this.mergeCumulativeSeriesDatas()
      this.setState({ mergedData, loadingStatus: LoadingStatus.IS_IDLE })
    } catch (err) {
      this.setState({ loadingStatus: LoadingStatus.HAS_ERRORED })
    }
  }

  onMouseUp = () => {
    this.zoom()
  }

  zoom = () => {
    let { startDate, endDate, mergedData } = this.state

    if (startDate === endDate || !endDate) {
      this.setState(() => ({
        startDate: null,
        endDate: null
      }))
      return
    }

    // xAxis domain
    if (startDate > endDate) [startDate, endDate] = [endDate, startDate]

    const filteredData = mergedData.filter(({ date }: { date: string }) => {
      const d = new Date(date)
      return d >= startDate && d <= endDate
    })

    // xAxis domain
    let bottom: number, top: number

    for (const { cases, deaths, recovered } of filteredData) {
      const min = Math.min(cases, deaths, recovered)
      const max = Math.max(cases, deaths, recovered)
      if (isNaN(bottom) || isNaN(top)) {
        bottom = min
        top = max
        continue
      }
      if (min < bottom) bottom = min
      if (max > top) top = max
    }

    this.setState(() => ({
      mergedData: filteredData,
      top,
      bottom,
      left: moment(startDate).format('YYYY-MM-DD'),
      right: moment(endDate).format('YYYY-MM-DD'),
      selectedStartDate: startDate,
      selectedEndDate: endDate,
      startDate: null,
      endDate: null
    }))
  }

  onZoomOutClick = () => {
    this.zoomOut()
  }

  zoomOut = () => {
    this.setState(() => this.defaultState)
  }

  render () {
    const {
      selectedPlace
    } = this.props

    const {
      mergedData,
      left,
      right,
      startDate,
      endDate,
      selectedStartDate,
      selectedEndDate,
      top,
      bottom,
      zoomEnabled,
      selectedPlaces,
      graphType
    } = this.state

    const graphTypeSelect = (
      <SelectInputComponent
        selectedItem={graphType}
        options={Object.values(GraphType)}
        onChange={(graphType: GraphType) => this.setState({ graphType })}
        itemToString={(graphType: GraphType) => capitalize(graphType)}
        buttonClassName="btn btn-white flex items-center border border-light text-sm rounded-sm px-2 py-1 font-bold"
        buttonContentComponent={(graphType: GraphType) => <span className="mr-2">Compare: {capitalize(graphType)}</span>}
      />
    )

    const yAxisScaleTypeSelect = (
      <SelectInputComponent
        selectedItem={this.state.yAxisScaleType}
        options={Object.values(YAxisScaleType)}
        onChange={(yAxisScaleType: YAxisScaleType) => this.setState({ yAxisScaleType })}
        itemToString={(yAxisScaleType: YAxisScaleType) => capitalize(yAxisScaleType)}
        buttonClassName="btn btn-white flex items-center border border-light rounded-sm px-2 py-1 text-xs"
        buttonContentComponent={(yAxisScaleType: YAxisScaleType) => <span className="mr-2">Scale: {capitalize(yAxisScaleType)}</span>}
      />
    )

    const placeSelects = Array.from(new Array(3)).map((_, i) => (
      <TypeaheadSelectInputComponent
        key={i}
        selectedItem={selectedPlaces.find(({ index }) => index === i) ?? null}
        options={this.props.places}
        onChange={place => {
          this.setState(prevState => {
            if (place) {
              return {
                selectedPlaces: [
                  ...prevState.selectedPlaces.filter(({ index }) => index !== i),
                  { index: i, place }
                ]
              }
            } else {
              return {
                selectedPlaces: [
                  ...prevState.selectedPlaces.filter(({ index }) => index !== i)
                ]
              }
            }
          }, () => {
            if (place) this.fetchAndMergeData(place)
          })
        }}
        inputPlaceholder={`Select ${this.props.selectedPlace.typeId}...`}
        inputClassName="text-xs"
        itemToString={(place: Place) => place?.name}
        className="my-px"
      />
    ))

    return (
      <div className="dashboard-panel flex flex-col select-none">
        <div className="flex flex-shrink-0 flex-col md:flex-row md:items-center mb-2">
          <div className="flex-shrink-0">
            {graphTypeSelect}
          </div>
          <div className="flex flex-wrap items-center justify-end flex-1">
            <div className="mr-2">
              {
                selectedStartDate && selectedEndDate
                  ? (
                    <div className="inline-flex items-center rounded-sm bg-lighter text-xs px-2 py-1 font-bold">
                      <span>{Date.rangeToString(selectedStartDate, selectedEndDate)}</span>
                      <button
                        onClick={this.onZoomOutClick}
                        className="hover:opacity-50 pl-2 pr-1 py-1"
                      >
                        <CloseSvg className="h-line-sm" />
                      </button>
                    </div>
                  )
                  : <span className="text-xs font-bold">Drag to zoom</span>
              }
            </div>
            <div>
              {yAxisScaleTypeSelect}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 flex-shrink-0 mb-1">
          {placeSelects}
        </div>
        <div className="flex flex-1" style={{ minHeight: '1px' }}>
          {(() => {
            if (!Array.isArray(mergedData)) {
              return (
                <div className="flex flex-1 items-center justify-center">
                  <LoadingComponent className="h-8" />
                </div>
              )
            }
            return (
              <ResponsiveContainer>
                <LineChart
                  data={mergedData}
                  onMouseDown={e => {
                    if (e?.activeLabel) this.setState({ startDate: moment(e.activeLabel).toDate() })
                  }}
                  onMouseMove={e => {
                    if (e?.activeLabel && this.state.startDate) {
                      this.setState({ endDate: moment(e.activeLabel).toDate() })
                    }
                  }}
                  onMouseUp={this.onMouseUp}
                >
                  {
                    [{ place: selectedPlace }, ...selectedPlaces]
                      .map(({ place }) => {
                        return (<Line
                          key={place.id}
                          connectNulls={true}
                          type="monotone"
                          dataKey={`${place.id}.${graphType}`}
                          name={place.name}
                          stroke={brand}
                          dot={{ r: 1}}
                          strokeWidth="2"
                          isAnimationActive={true}
                          animationDuration={200}
                        />)
                      })
                  }
                  <CartesianGrid stroke={brandDull} strokeDasharray="5 5" />
                  <XAxis
                    allowDataOverflow
                    dataKey="date"
                    tickFormatter={(value: string) => moment(value).format('DD MMM')}
                    padding={{ left: 5, right: 5 }}
                    domain={[left, right]}
                    stroke={brand}
                  />
                  <YAxis
                    allowDataOverflow
                    scale={(() => {
                      switch (this.state.yAxisScaleType) {
                        case (YAxisScaleType.LINEAR):
                          return scaleLinear()
                        case (YAxisScaleType.LOGARITHMIC):
                          return scaleLog().clamp(true)
                      }
                    })()}
                    tickFormatter={(value: number) => numeral(value).format(value >= 1000 ? '0.[0]a' : '0,0')}
                    padding={{ top: 5, bottom: 0 }}
                    domain={[
                      (() => {
                        if (this.state.yAxisScaleType === YAxisScaleType.LOGARITHMIC) {
                          return 1
                        }
                        return bottom
                      })(),
                      top
                    ]}
                    type="number"
                    stroke={brand}
                  />
                  <Tooltip />
                  {
                    startDate && endDate && zoomEnabled
                      ? (
                        <ReferenceArea
                          x1={moment(startDate).format('YYYY-MM-DD')}
                          x2={moment(endDate).format('YYYY-MM-DD')}
                          strokeOpacity={0.3}
                        />
                      )
                      : null
                  }
                </LineChart>
              </ResponsiveContainer>
            )
          })()}
        </div>
      </div>
    )
  }
}
