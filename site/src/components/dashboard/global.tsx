import { Component, HTMLAttributes } from 'react'
import { DashboardStatsComponent } from './stats'
import { observer, inject } from 'mobx-react'
import { DashboardPageStore } from '../../pages/dashboard.store'

export interface Props extends HTMLAttributes<HTMLDivElement> {
  pageStore?: DashboardPageStore
}

@inject('pageStore')
@observer
export class DashboardGlobalComponent extends Component<Props> {
  render () {
    const {
      pageStore,
      className = '',
      ...props
    } = this.props

    return (
      <div className={`dashboard-panel ${className}`} {...props}>
        <div className="flex items-center pb-2">
          <div className="flex-shrink-0">
            <h2 className="font-bold">Global Stats</h2>
          </div>
          <div className="flex-1 flex justify-end -mx-1">
            <div className="px-1">
              <button
                className="btn btn-white px-3 py-1 rounded-sm border border-light text-sm 2xl:text-base"
              >
                View stats by country
              </button>
            </div>
            <div className="px-1">
              <button
                className="btn btn-white px-3 py-1 rounded-sm border border-light text-sm 2xl:text-base"
              >
                View heatmap
              </button>
            </div>
          </div>
        </div>
        <DashboardStatsComponent
          rawData={pageStore.rawPlaceData.earth}
          className="pl-2"
        />
      </div>
    )
  }
}
