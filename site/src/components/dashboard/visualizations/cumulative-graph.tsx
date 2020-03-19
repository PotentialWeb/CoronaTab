import { Component } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Legend, Bar, ReferenceArea } from 'recharts'
import tailwindConfig from '../../../utils/tailwind'
import moment from 'moment'
import CloseSvg from '../../../../public/icons/close.svg'

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
}

export class DashboardCumulativeGraphComponent extends Component<Props, State> {
  state: State = {
    ...this.defaultState
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

    return (
      <div className="dashboard-panel select-none">
        <div className="flex items-center">
          <div className="flex-1">
            <h2 className="font-bold">
              Cumulative
            </h2>
          </div>
          <div className="justify-end flex-shrink-0 flex-grow-0">
            {
              selectedStartDate && selectedEndDate
                ? (
                  <>
                    <span className="text-xs font-bold mr-2">Zoomed:</span>
                    <div className="inline-flex items-center rounded bg-lighter text-sm px-2 py-1 font-bold">
                      <span>{Date.rangeToString(selectedStartDate, selectedEndDate)}</span>
                      <button
                        onClick={this.onZoomOutClick}
                        className="hover:opacity-50 pl-2 pr-1 py-1"
                      >
                        <CloseSvg className="h-line-sm" />
                      </button>
                    </div>
                  </>
                )
                : <span className="text-xs font-bold mr-2">Drag to zoom</span>
            }
          </div>
        </div>
        <div style={{ height: '360px' }}>
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
                domain={[left, right]}
                stroke={brand}
              />
              <YAxis
                allowDataOverflow
                domain={[bottom, top]}
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
        </div>
      </div>
    )
  }
}
