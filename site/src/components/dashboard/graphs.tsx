import { Component } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Legend, Bar } from 'recharts'
import tailwindConfig from '../../utils/tailwind'

export class DashboardCumulativeGraphComponent extends Component<{
  data: any
}> {
  render () {
    return (
      <ResponsiveContainer>
        <LineChart
          data={this.props.data}
        >
          <Line type="monotone" dataKey="cases" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="deaths" stroke={tailwindConfig.theme.colors.fail} />
          <Line type="monotone" dataKey="recovered" stroke="#82ca9d" />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="date" />
          <YAxis />
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
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 'dataMax']} />
          <Tooltip />
          <Legend />
          <Bar dataKey="cases" fill="#8884d8" />
          <Bar dataKey="deaths" fill={tailwindConfig.theme.colors.fail} />
          <Bar dataKey="recovered" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    )
  }
}
