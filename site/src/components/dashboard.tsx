import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { DashboardPageStore } from '../pages/dashboard.store'
import { Meta } from '../utils/meta'
import { DashboardStatsComponent } from './dashboard/stats'
import { PlaceSelectComponent } from './place-select'
import { DashboardQuickLinksComponent } from './dashboard/quick-links'
import { DashboardSelectedPlaceComponent } from './dashboard/selected-place'
import LogoTextSvg from '../../public/icons/logo-text.svg'

interface Props {
  pageStore?: DashboardPageStore
}

@inject('pageStore')
@observer
export class DashboardComponent extends Component<Props> {
  render () {
    const { pageStore } = this.props

    return (
      <main className="dashboard">
        <div className="dashboard-stats-container">

          <div className="dashboard-nav flex items-center">
            <div className="flex-1">
              <LogoTextSvg className="h-10" />
            </div>
            <div className="flex-1 last-updated text-right">
              <span className="text-xs">
                Last Updated: {pageStore.lastUpdated?.toISOString()}
              </span>
            </div>
          </div>

          {
            window?.self === window?.top
              ? (
                <div>
                  <a href={Meta.EXTENSION_URL} target="_blank">
                    Download browser extension
                  </a>
                </div>
              )
              : ''
          }

          <DashboardStatsComponent
            title="Global Stats"
            rawData={pageStore.rawGlobalData}
          />

          <div className="region-select">
            <h2 className="font-bold">
              Select a region
            </h2>

            <div>
              <PlaceSelectComponent
                initialValue={pageStore.selectedPlace}
                options={pageStore.places}
                onChange={place => { pageStore.selectedPlace = place }}
              />
            </div>
          </div>

          {
            pageStore.selectedPlace
              ? (
                <DashboardSelectedPlaceComponent
                  place={pageStore.selectedPlace}
                />
              )
              : (
                <div className="flex items-center justify-center h-24">
                  Select a region to see data
                </div>
              )
          }

        </div>

        <div className="dashboard-advice-container">
          <div className="general-advice">
            <h2 className="font-bold">General Advice</h2>
            <div>
              {
                pageStore.advice
                  ? (
                    Object.entries(pageStore.advice)
                      .map(([key, { title, description }]) => {
                        return (
                          <div key={key}>
                            <h3>{title}</h3>
                            <p>{description}</p>
                          </div>
                        )
                      })
                  )
                  : ''
              }
            </div>
          </div>

          <div className="local-advice">
            <h2 className="font-bold">Local Advice</h2>
            <span>In your region...</span>
          </div>

          <DashboardQuickLinksComponent />
        </div>
      </main>
    )
  }
}
