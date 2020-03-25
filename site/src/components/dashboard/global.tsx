import { Component, HTMLAttributes } from 'react'
import { DashboardStatsComponent } from './stats'
import { observer, inject } from 'mobx-react'
import { DashboardPageStore } from '../../pages/dashboard.store'
import { DashboardGlobalStatsByCountryModalComponent } from './global/stats-by-country/modal'
import { DashboardCumulativeGraphComponent } from './visualizations/cumulative-graph'
import { DashboardDailyChartComponent } from './visualizations/daily-chart'
import { DashboardGlobalCountryLeaderboardComponent } from './global/country-leaderboard'

export interface Props extends HTMLAttributes<HTMLDivElement> {
  pageStore?: DashboardPageStore
}

export enum ModalStatus {
  IDLE = 'idle',
  STATS_BY_COUNTRY = 'statsByCountry'
}

export interface State {
  modalStatus: ModalStatus
}

@inject('pageStore')
@observer
export class DashboardGlobalComponent extends Component<Props, State> {
  state: State = {
    modalStatus: ModalStatus.IDLE
  }

  get data () {
    const { pageStore } = this.props
    if (!pageStore.rawPlaceData?.earth) return {}
    return {
      raw: pageStore.rawPlaceData.earth,
      cumulativeSeries: DashboardPageStore.parseCumulativeSeriesData(pageStore.rawPlaceData.earth),
      dailySeries: DashboardPageStore.calcDailySeriesData(pageStore.rawPlaceData.earth)
    }
  }

  render () {
    const {
      pageStore,
      className = '',
      ...props
    } = this.props

    const {
      modalStatus
    } = this.state

    return (
      <>
        <div className={`dashboard-panel ${className}`} {...props}>
          <div className="flex items-center pb-2">
            <div className="flex-shrink-0">
              <h2 className="font-bold">Global Stats</h2>
            </div>
            <div className="flex-1 flex justify-end -mx-1">
              <div className="px-1">
                <button
                  onClick={() => this.setState({ modalStatus: ModalStatus.STATS_BY_COUNTRY })}
                  className="btn btn-white px-3 py-1 rounded-sm border border-light text-sm 2xl:text-base"
                >
                  View stats by country
                </button>
              </div>
              {
                /*
                  <div className="px-1">
                    <button
                      className="btn btn-white px-3 py-1 rounded-sm border border-light text-sm 2xl:text-base"
                    >
                      View heatmap
                    </button>
                  </div>
                */
              }
            </div>
          </div>
          <DashboardStatsComponent
            rawData={this.data?.raw}
            className="pl-2"
          />
          <div className="dashboard-global-visualizations flex flex-row flex-wrap min-w-0">
            <div className="w-full xl:w-1/2 4xl:w-1/3 dashboard-spacer">
              <DashboardGlobalCountryLeaderboardComponent />
            </div>
            <div className="w-full xl:w-1/2 4xl:w-1/3 dashboard-spacer">
              <DashboardCumulativeGraphComponent
                data={this.data?.cumulativeSeries}
              />
            </div>
            <div className="w-full xl:w-1/2 4xl:w-1/3 dashboard-spacer">
              <DashboardDailyChartComponent
                data={this.data?.dailySeries}
              />
            </div>
          </div>
        </div>
        <DashboardGlobalStatsByCountryModalComponent
          isVisible={modalStatus === ModalStatus.STATS_BY_COUNTRY}
          onExited={() => this.setState({ modalStatus: ModalStatus.IDLE })}
        />
      </>
    )
  }
}
