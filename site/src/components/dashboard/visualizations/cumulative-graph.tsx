import { PureComponent } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Legend, Bar, ReferenceArea } from 'recharts'
import { scaleLog, scaleLinear } from 'd3-scale'
import tailwindConfig from '../../../utils/tailwind'
import moment from 'moment'
import Downshift from 'downshift'
import Tippy from '@tippyjs/react'
import capitalize from 'lodash.capitalize'
import numeral from 'numeral'
import CaretDownSvg from '../../../../public/icons/caret-down.svg'
import CaretUpSvg from '../../../../public/icons/caret-up.svg'
import CloseSvg from '../../../../public/icons/close.svg'
import { LoadingComponent } from '../../loading'
import { SvgRectComponent } from '../../svg-rect'

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
}

enum YAxisScaleType {
  LINEAR = 'linear',
  LOGARITHMIC = 'logarithmic'
}

interface State {
  data: any[]
  top: string | number
  bottom: string | number
  left: string | number
  right: string | number
  startDate?: Date
  endDate?: Date
  selectedStartDate?: Date
  selectedEndDate?: Date
  zoomEnabled?: boolean
  yAxisScaleType?: YAxisScaleType
}

export class DashboardCumulativeGraphComponent extends PureComponent<Props, State> {
  state: State = {
    ...this.defaultState,
    yAxisScaleType: YAxisScaleType.LINEAR
  }

  get defaultState (): State {
    return {
      data: [...this.props.data],
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
    this.setState(() => this.defaultState);
  }

  render () {
    const {
      data, left, right, startDate, endDate, selectedStartDate, selectedEndDate, top, bottom, zoomEnabled
    } = this.state

    const yAxisScaleTypeSelect = (
      <Downshift
        selectedItem={this.state.yAxisScaleType}
        onChange={(yAxisScaleType: YAxisScaleType) => this.setState({ yAxisScaleType })}
      >
        {({
          getItemProps,
          getMenuProps,
          selectedItem,
          isOpen,
          highlightedIndex,
          getRootProps,
          setState
        }) => (
          <div className="select">
            <Tippy
              visible={isOpen}
              animation="shift-away"
              theme="light"
              className="select-list-tooltip"
              allowHTML={true}
              content={(
                <ul
                  {...getMenuProps({}, { suppressRefError: true })}
                  className="select-list"
                >
                  {
                    isOpen
                      ? Object.values(YAxisScaleType)
                        .map((scaleType, index) => {
                          return (
                            <li
                              key={index}
                              {...getItemProps({
                                index,
                                item: scaleType
                              })}
                              data-highlighted={highlightedIndex === index}
                              className="select-list-item"
                            >
                              <span className="font-bold">{capitalize(scaleType)}</span>{' '}
                            </li>
                          )
                        })
                      : ''
                  }
                </ul>
              )}
              arrow={true}
              placement="bottom-start"
              duration={100}
              onHidden={() => setState({ isOpen: false })}
              interactive
            >
              <div
                {...getRootProps({} as any, { suppressRefError: true })}
                className="select-input-area"
              >
                <button
                  className="btn btn-white flex items-center border border-light rounded-sm px-2 py-1 text-xs"
                  onClick={() => setState({ isOpen: true })}
                >
                  <span className="mr-2">Scale: {capitalize(selectedItem)}</span>
                  {
                    isOpen
                      ? (<CaretUpSvg className="h-line-sm" />)
                      : (<CaretDownSvg className="h-line-sm" />)
                  }
                </button>
              </div>
            </Tippy>
          </div>
        )}
      </Downshift>
    )

    return (
      <div className="dashboard-panel flex flex-col select-none">
        <div className="flex flex-shrink-0 flex-col md:flex-row md:items-center mb-2">
          <div className="flex-1">
            <h2 className="text-lg font-bold">
              Cumulative
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-end flex-shrink-0 flex-grow-0">
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
                  <Line type="monotone" dataKey="cases" name="Cases" stroke={brand} dot={{ r: 1}} strokeWidth="2" isAnimationActive={true} animationDuration={200} />
                  <Line type="monotone" dataKey="deaths" name="Deaths" stroke={red} dot={{ r: 1 }} strokeWidth="2" isAnimationActive={true} animationDuration={200} />
                  <Line type="monotone" dataKey="recovered" name="Recovered" dot={{ r: 1 }} stroke={green} strokeWidth="2" isAnimationActive={true} animationDuration={200} />
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
