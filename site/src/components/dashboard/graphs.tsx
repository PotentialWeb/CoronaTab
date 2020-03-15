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
          <Line type="monotone" dataKey="cases" stroke={brand} activeDot={{ r: 8 }} strokeWidth="2" />
          <Line type="monotone" dataKey="deaths" stroke={red} strokeWidth="2" />
          <Line type="monotone" dataKey="recovered" stroke={green} strokeWidth="2" />
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
          <Bar dataKey="cases" fill={brand} strokeWidth="2" />
          <Bar dataKey="deaths" fill={red} />
          <Bar dataKey="recovered" fill={green} />
        </BarChart>
      </ResponsiveContainer>
    )
  }
}
