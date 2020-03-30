import { Component, HTMLAttributes } from 'react'
import { DashboardStatsComponent } from './stats'
import { observer, inject } from 'mobx-react'
import { DashboardPageStore } from '../../pages/dashboard.store'
import { DashboardGlobalStatsByCountryModalComponent } from './global/stats-by-country/modal'
import { DashboardCumulativeGraphComponent } from './visualizations/cumulative-graph'
import { DashboardDailyChartComponent } from './visualizations/daily-chart'
import { DashboardGlobalCountryLeaderboardComponent } from './global/country-leaderboard'
import { DashboardGlobalHeatmapModalComponent } from './global/heatmap/modal'
import EarthSvg from '../../../public/icons/earth.svg'
import ListSvg from '../../../public/icons/list.svg'
import { SvgRectComponent } from '../svg-rect'

export interface Props extends HTMLAttributes<HTMLDivElement> {
  pageStore?: DashboardPageStore
}

export enum ModalStatus {
  IDLE = 'idle',
  STATS_BY_COUNTRY = 'statsByCountry',
  HEATMAP = 'heatmap'
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
          <div className="flex flex-col xl:flex-row xl:items-center pb-2">
            <div className="flex-shrink-0">
              <span className="flex items-center text-lg xl:text-4xl">
                <EarthSvg className="h-line mr-2 2xl:mr-4" />
                <h2 className="font-bold xl:hidden">Global</h2>
              </span>
            </div>
            <div className="flex-1 flex">
              <DashboardStatsComponent
                rawData={this.data?.raw}
                className="flex-1 pl-2"
              />
            </div>
          </div>
          <div className="dashboard-global-visualizations">
            <div className="dashboard-global-visualizations-country-leaderboard dashboard-spacer">
              <DashboardGlobalCountryLeaderboardComponent />
            </div>
            <div className="dashboard-spacer">
              <DashboardCumulativeGraphComponent
                data={this.data?.cumulativeSeries}
              />
            </div>
            <div className="dashboard-spacer">
              <DashboardDailyChartComponent
                data={this.data?.dailySeries}
              />
            </div>
            <div className="dashboard-global-visualizations-stats-by-country dashboard-spacer">
              <button
                onClick={() => this.setState({ modalStatus: ModalStatus.STATS_BY_COUNTRY })}
                className="dashboard-panel overflow-hidden btn btn-white p-0 w-full flex items-stretch"
              >
                <div className="relative border-r border-light">
                  <SvgRectComponent ratio="21:9" className="w-auto h-16 min-h-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ListSvg className="text-2xl h-line" />
                  </div>
                </div>
                <div className="flex items-center flex-1 p-4">
                  View all stats by country
                </div>
              </button>
            </div>
            <div className="dashboard-global-visualizations-heatmap dashboard-spacer">
              <button
                onClick={() => this.setState({ modalStatus: ModalStatus.HEATMAP })}
                className="dashboard-panel overflow-hidden btn btn-brand-dark p-0 w-full flex items-stretch"
              >
                <div className="bg-cover" style={{ backgroundImage: `url('/graphics/heatmap.jpg')`}}>
                  <SvgRectComponent ratio="21:9" className="w-auto h-16 min-h-full" />
                </div>
                <div className="flex items-center flex-1 p-4">
                  View heatmap
                </div>
              </button>
            </div>
          </div>
        </div>
        <DashboardGlobalStatsByCountryModalComponent
          isVisible={modalStatus === ModalStatus.STATS_BY_COUNTRY}
          onExited={() => this.setState({ modalStatus: ModalStatus.IDLE })}
        />
        <DashboardGlobalHeatmapModalComponent
          isVisible={modalStatus === ModalStatus.HEATMAP}
          onExited={() => this.setState({ modalStatus: ModalStatus.IDLE })}
        />
      </>
    )
  }
}
