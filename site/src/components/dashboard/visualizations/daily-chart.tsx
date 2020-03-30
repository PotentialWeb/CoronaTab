import { Component } from 'react'
import { CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Legend, Bar } from 'recharts'
import tailwindConfig from '../../../utils/tailwind'
import Downshift from 'downshift'
import Tippy from '@tippyjs/react'
import { scaleTime } from 'd3-scale'
import CaretDownSvg from '../../../../public/icons/caret-down.svg'
import CaretUpSvg from '../../../../public/icons/caret-up.svg'
import moment from 'moment'
import numeral from 'numeral'
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
  data: any[]
}

const timeframes = [7, 14, 21] as const
type Timeframe = typeof timeframes[number]

interface State {
  timeframe: Timeframe
}

export class DashboardDailyChartComponent extends Component<Props, State> {
  state: State = {
    timeframe: 7 as Timeframe
  }

  filterDataByTimeframe = (data: any[]) => {
    const fromDate = moment().subtract(this.state.timeframe, 'days')
    return data.filter(({ date }) => moment(date, 'YYYY-MM-DD') > fromDate)
  }

  render () {
    const timeframeSelect = (
      <Downshift
        selectedItem={this.state.timeframe}
        onChange={(timeframe: Timeframe) => this.setState({ timeframe })}
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
                      ? timeframes
                        .map((timeframe, index) => {
                          return (
                            <li
                              key={index}
                              {...getItemProps({
                                index,
                                item: timeframe
                              })}
                              data-highlighted={highlightedIndex === index}
                              className="select-list-item"
                            >
                              <span className="font-bold">{timeframe} days</span>{' '}
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
              maxWidth="none"
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
                  <span className="mr-2">Last {selectedItem} days</span>
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
        <div className="flex flex-col md:flex-row md:items-center mb-2">
          <div className="flex-1">
            <h2 className="text-lg font-bold">
              Daily
            </h2>
          </div>
          <div className="flex items-center justify-end flex-shrink-0 flex-grow-0">
            <div>
              {timeframeSelect}
            </div>
          </div>
        </div>
        <div className="flex-1" style={{ minHeight: '1px' }}>
          {(() => {
            if (!this.props?.data?.length) {
              return (
                <div className="flex flex-1 items-center justify-center">
                  <LoadingComponent className="h-8" />
                </div>
              )
            }
            const fromDate = moment().subtract(this.state.timeframe, 'days')
            const data = this.props.data.filter(({ date }) => moment(date) > fromDate)
            return (
              <ResponsiveContainer>
                <BarChart
                  data={data}
                >
                  <Bar dataKey="cases" name="Cases" fill={brand} isAnimationActive={false} />
                  <Bar dataKey="deaths" name="Deaths" fill={red} isAnimationActive={false} />
                  <Bar dataKey="recovered" name="Recovered" fill={green} isAnimationActive={false} />
                  <CartesianGrid strokeDasharray="3 3" stroke={brandDull} />
                  <XAxis
                    allowDataOverflow
                    tickFormatter={(value: string) => moment(value).format('DD MMM')}
                    dataKey="date"
                    stroke={brand}
                  />
                  <YAxis
                    allowDataOverflow
                    tickFormatter={(value: number) => numeral(value).format(value >= 1000 ? '0.[0]a' : '0,0')}
                    domain={[0, 'dataMax']}
                    stroke={brand}
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            )
          })()}
        </div>
      </div>
    )
  }
}
