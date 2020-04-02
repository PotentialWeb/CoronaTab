import { PureComponent } from 'react'
import { CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Legend, Bar } from 'recharts'
import tailwindConfig from '../../../utils/tailwind'
import moment from 'moment'
import numeral from 'numeral'
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
      'brand-dull': brandDull
    }
  }
} = tailwindConfig

interface Props {
  appStore?: AppStore
  data: any[]
}

const timeframes = [7, 14, 21] as const
type Timeframe = typeof timeframes[number]

interface State {
  timeframe: Timeframe
}

@inject('appStore')
@observer
export class DashboardDailyChartComponent extends PureComponent<Props, State> {
  state: State = {
    timeframe: 7 as Timeframe
  }

  filterDataByTimeframe = (data: any[]) => {
    const fromDate = moment().subtract(this.state.timeframe, 'days')
    return data.filter(({ date }) => moment(date, 'YYYY-MM-DD') > fromDate)
  }

  render () {
    const { appStore } = this.props
    const { t } = appStore
    const { timeframe } = this.state

    const timeframeSelect = (
      <SelectInputComponent
        selectedItem={timeframe}
        options={[...timeframes]}
        itemToString={(timeframe: Timeframe) => `${timeframe} ${t('days')}`}
        onChange={(timeframe: Timeframe) => this.setState({ timeframe })}
        buttonClassName="btn btn-white flex items-center border border-light rounded-sm px-2 py-1 text-xs"
      />
    )

    return (
      <div className="dashboard-panel flex flex-col select-none">
        <div className="flex flex-col md:flex-row md:items-center mb-2">
          <div className="flex-1">
            <h2 className="text-lg font-bold">
              {t('daily')}
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
                  <Bar dataKey="cases" name={t('cases') as string} fill={brand} isAnimationActive={false} />
                  <Bar dataKey="deaths" name={t('deaths') as string} fill={red} isAnimationActive={false} />
                  <Bar dataKey="recovered" name={t('recovered') as string} fill={green} isAnimationActive={false} />
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
