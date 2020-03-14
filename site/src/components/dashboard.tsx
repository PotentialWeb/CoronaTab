import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { DashboardPageStore } from '../pages/dashboard.store'
import { Meta } from '../utils/meta'
import { DashboardStatsComponent } from './dashboard/stats'
import { PlaceSelectComponent } from './place-select'
import { DashboardQuickLinksComponent } from './dashboard/quick-links'
import { DashboardSelectedPlaceComponent } from './dashboard/selected-place'
import LogoTextSvg from '../../public/icons/logo-text.svg'
import { DashboardGeneralAdviceComponent } from './dashboard/general-advice'

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
        <div className="dashboard-col">

          <div className="dashboard-panel-container">
            <div className="dashboard-nav">
              <div className="flex-1">
                <LogoTextSvg className="h-10" />
              </div>
              <div className="flex-1 last-updated text-right">
                <span className="text-xs">
                  Last Updated: {pageStore.lastUpdated?.toISOString()}
                </span>
              </div>
            </div>
          </div>

          {
            window?.self === window?.top
              ? (
                <div className="dashboard-panel-container">
                  <div className="dashboard-download-browser-extension">
                    <a href={Meta.EXTENSION_URL} target="_blank">
                      Download browser extension
                    </a>
                  </div>
                </div>
              )
              : ''
          }

          {
            pageStore.rawGlobalData.length
              ? (
                <div className="dashboard-panel-container">
                  <div className="dashboard-panel dashboard-global-stats-panel">
                    <DashboardStatsComponent
                      title="Global Stats"
                      rawData={pageStore.rawGlobalData}
                    />
                  </div>
                </div>
              )
              : ''
          }

          <div className="dashboard-panel-container flex-1 min-h-0">
            <div className="dashboard-panel dashboard-selected-place-panel">
              <h2 className="font-bold">
                Select a region
              </h2>

              <div className="flex">
                <PlaceSelectComponent
                  initialValue={pageStore.selectedPlace}
                  options={pageStore.places}
                  onChange={place => {
                    pageStore.selectedPlace = place
                    pageStore.selectedPlaceDetail = place
                  }}
                />
                {
                  pageStore.selectedPlace.children.length
                    ? (
                      <PlaceSelectComponent
                        initialValue={pageStore.selectedPlace.children[0]}
                        options={pageStore.selectedPlace.children}
                        onChange={place => { pageStore.selectedPlaceDetail = place }}
                      />
                    )
                    : ''
                }
              </div>

              {
                pageStore.selectedPlace
                  ? (
                    <DashboardSelectedPlaceComponent
                      place={pageStore.selectedPlaceDetail}
                    />
                  )
                  : (
                    <div className="flex items-center justify-center h-24">
                      Select a region to see data
                    </div>
                  )
              }
            </div>
          </div>
        </div>

        <div className="dashboard-col">

          <div className="dashboard-panel-container">
            <div className="dashboard-panel">
              <DashboardQuickLinksComponent />
            </div>
          </div>

          <div className="dashboard-panel-container flex-1 min-h-0">
            <div className="dashboard-panel">
              <DashboardGeneralAdviceComponent />
            </div>
          </div>


          {/*<div className="local-advice">
            <h2 className="font-bold">Local Advice</h2>
            <span>Regionalised information for how to take action if you or a loved one are ill.</span>
          </div>*/}

          <div className="dashboard-panel-container">
            <div className="dashboard-panel">
              Share - Fork on GitHub
            </div>
          </div>

        </div>
      </main>
    )
  }
}
