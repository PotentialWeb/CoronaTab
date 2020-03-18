import { Component } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Legend, Bar } from 'recharts'
import tailwindConfig from '../../utils/tailwind'

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

export class DashboardCumulativeGraphComponent extends Component<{
  data: any
}> {
  render () {
    return (
      <ResponsiveContainer>
        <LineChart
          data={this.props.data}
        >
          <Line type="monotone" dataKey="cases" name="Cases" stroke={brand} activeDot={{ r: 8 }} strokeWidth="2" isAnimationActive={false} />
          <Line type="monotone" dataKey="deaths" name="Deaths" stroke={red} strokeWidth="2" isAnimationActive={false} />
          <Line type="monotone" dataKey="recovered" name="Recovered" stroke={green} strokeWidth="2" isAnimationActive={false} />
          <CartesianGrid stroke={brandDull} strokeDasharray="5 5" />
          <XAxis dataKey="date" stroke={brand} />
          <YAxis stroke={brand} />
          <Tooltip />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    )
  }
}

export class DashboardDailyChartComponent extends Component<{
  data: any
}> {
  render () {
    return (
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
    )
  }
}
