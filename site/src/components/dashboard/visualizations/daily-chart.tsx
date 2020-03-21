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
