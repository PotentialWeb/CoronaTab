import { PureComponent } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceArea, ReferenceLine } from 'recharts'
import { scaleLog, scaleLinear } from 'd3-scale'
import tailwindConfig from '../../../utils/tailwind'
import moment from 'moment'
import capitalize from 'lodash.capitalize'
import numeral from 'numeral'
import CloseSvg from '../../../../public/icons/close.svg'
import { LoadingComponent } from '../../loading'
import { inject, observer } from 'mobx-react'
import { AppStore } from '../../../pages/_app.store'
import { SelectInputComponent } from '../../inputs/select'

const {
  theme: {
    colors: {
      red,
      green,
      brand,
      'brand-light': brandLight,
      'brand-dull': brandDull
    }
  }
} = tailwindConfig

interface Props {
  appStore?: AppStore
  data: any
  projectedData: any
}

enum YAxisScaleType {
  LINEAR = 'linear',
  LOGARITHMIC = 'logarithmic'
}

export interface ZoomableGraphState {
  top: string | number
  bottom: string | number
  left: string | number
  right: string | number
  startDate?: Date
  endDate?: Date
  selectedStartDate?: Date
  selectedEndDate?: Date
  zoomEnabled?: boolean
}

interface State extends ZoomableGraphState {
  data: any[]
  yAxisScaleType?: YAxisScaleType
  projectionEnabled?: boolean
}

const INITIAL_PROJECTION_ENABLED_STATE = true

@inject('appStore')
@observer
export class DashboardCumulativeGraphComponent extends PureComponent<Props, State> {
  getDataArray = (forceProjection = false) => ([
    ...this.props.data,
    ...(
      this.state?.projectionEnabled ?? forceProjection
        ? this.props.projectedData
        : []
    )
  ])

  state: State = {
    ...this.defaultState,
    yAxisScaleType: YAxisScaleType.LINEAR,
    projectionEnabled: INITIAL_PROJECTION_ENABLED_STATE
  }

  get defaultState (): State {
    return {
      data: this.getDataArray(INITIAL_PROJECTION_ENABLED_STATE),
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

  onMouseUp = () => {
    this.zoom()
  }

  zoom = () => {
    let { startDate, endDate, data } = this.state

    if (startDate === endDate || !endDate) {
      this.setState(() => ({
        startDate: null,
        endDate: null
      }))
      return
    }

    // xAxis domain
    if (startDate > endDate) [startDate, endDate] = [endDate, startDate]

    const filteredData = data.filter(({ date }: { date: string }) => {
      const d = new Date(date)
      return d >= startDate && d <= endDate
    })

    // xAxis domain
    let bottom: number
    let top: number

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
      data: filteredData,
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

  toggleProjection = () => {
    this.zoomOut()
    this.setState(prevState => ({
      projectionEnabled: !prevState.projectionEnabled
    }), () => {
      this.setState({
        data: this.getDataArray()
      })
    })
  }

  get referenceLineDate () {
    const fallbackToNow = moment().format('YYYY-MM-DD')
    return Array.isArray(this.props.data) && this.props.data.length > 0
      ? this.props.data[this.props.data.length - 1]?.date ?? fallbackToNow
      : fallbackToNow
  }

  render () {
    const { appStore } = this.props
    const { t } = appStore
    const {
      data,
      left,
      right,
      startDate,
      endDate,
      selectedStartDate,
      selectedEndDate,
      top,
      bottom,
      zoomEnabled,
      projectionEnabled
    } = this.state

    const yAxisScaleTypeSelect = (
      <SelectInputComponent
        selectedItem={this.state.yAxisScaleType}
        options={Object.values(YAxisScaleType)}
        onChange={(yAxisScaleType: YAxisScaleType) => this.setState({ yAxisScaleType })}
        itemToString={(yAxisScaleType: YAxisScaleType) => capitalize(t(yAxisScaleType))}
        buttonClassName="btn btn-white flex items-center border border-light rounded-sm px-2 py-1 text-xs"
        buttonContentComponent={(yAxisScaleType: YAxisScaleType) => <span className="mr-2">{t('scale')}: {capitalize(t(yAxisScaleType))}</span>}
      />
    )

    return (
      <div className="dashboard-panel flex flex-col select-none">
        <div className="flex flex-shrink-0 flex-col md:flex-row md:items-center mb-1">
          <div className="flex-1">
            <h2 className="text-lg font-bold">
              {t('cumulative')}
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-end flex-shrink-0 flex-grow-0">
            <div className="mr-2">
              <button
                onClick={this.toggleProjection}
                className="btn btn-white flex items-center border border-light rounded-sm px-2 py-1 text-xs"
              >
                {t('projection')}: {projectionEnabled ? t('on') : t('off')}
              </button>
            </div>
            <div>
              {yAxisScaleTypeSelect}
            </div>
          </div>
        </div>
        <div className="flex justify-end mb-1">
          <div>
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
                : <span className="text-xs font-bold">{t('drag-to-zoom')}</span>
            }
          </div>
        </div>
        <div className="flex flex-1" style={{ minHeight: '1px' }}>
          {(() => {
            if (!Array.isArray(data)) {
              return (
                <div className="flex flex-1 items-center justify-center">
                  <LoadingComponent className="h-8" />
                </div>
              )
            }
            return (
              <ResponsiveContainer>
                <LineChart
                  data={data}

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
                  <Line type="monotone" dataKey="cases" name={t('cases') as string} stroke={brand} dot={{ r: 1 }} strokeWidth="2" isAnimationActive={true} animationDuration={200} />
                  <Line type="monotone" dataKey="deaths" name={t('deaths') as string} stroke={red} dot={{ r: 1 }} strokeWidth="2" isAnimationActive={true} animationDuration={200} />
                  <Line type="monotone" dataKey="recovered" name={t('recovered') as string} dot={{ r: 1 }} stroke={green} strokeWidth="2" isAnimationActive={true} animationDuration={200} />
                  <CartesianGrid stroke={brandDull} strokeDasharray="5 5" />
                  {
                    projectionEnabled
                      ? (
                        <ReferenceLine
                          x={this.referenceLineDate}
                          stroke={brandLight}
                        />
                      )
                      : ''
                  }
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
                  <Legend />
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
