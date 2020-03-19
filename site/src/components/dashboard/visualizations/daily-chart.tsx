import { Component } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Legend, Bar, ReferenceArea } from 'recharts'
import tailwindConfig from '../../../utils/tailwind'

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

export class DashboardDailyChartComponent extends Component<{
  data: any
}> {
  render () {
    return (
      <div className="dashboard-panel select-none">
        <div className="flex items-center">
          <div className="flex-1">
            <h2 className="font-bold">
              Daily
            </h2>
          </div>
          <div className="justify-end flex-shrink-0 flex-grow-0">
            {/*
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
                */}
          </div>
        </div>
        <div style={{ height: '360px' }}>
          <ResponsiveContainer>
            <BarChart
              data={this.props.data}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={brandDull} />
              <XAxis dataKey="date" stroke={brand} />
              <YAxis domain={[0, 'dataMax']} stroke={brand} />
              <Tooltip />
              <Legend />
              <Bar dataKey="cases" name="Cases" fill={brand} isAnimationActive={false} />
              <Bar dataKey="deaths" name="Deaths" fill={red} isAnimationActive={false} />
              <Bar dataKey="recovered" name="Recovered" fill={green} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }
}
