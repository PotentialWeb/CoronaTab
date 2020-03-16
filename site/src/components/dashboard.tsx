import { Component } from 'react'
import Router from 'next/router'
import { inject, observer } from 'mobx-react'
import { DashboardPageStore } from '../pages/dashboard.store'
import { DashboardStatsComponent } from './dashboard/stats'
import { PlaceSelectComponent } from './place-select'
import { DashboardQuickLinksComponent } from './dashboard/quick-links'
import { DashboardSelectedPlaceComponent } from './dashboard/selected-place'
import { DashboardGeneralAdviceComponent } from './dashboard/general-advice'
import { DashboardFooterComponent } from './dashboard/footer'
import { ShareBtnComponent } from './share-btn'
import { ExtensionDownloadBtnComponent } from './extension-download-btn'
import LogoTextSvg from '../../public/icons/logo-text.svg'

interface Props {
  pageStore?: DashboardPageStore
}

@inject('pageStore')
@observer
export class DashboardComponent extends Component<Props> {
  render () {
    const { pageStore } = this.props
    const iFramed = window?.self !== window?.top

    return (
      <main className="dashboard">
        <div className="dashboard-col w-3/5">

          <div className="dashboard-panel-container">
            <div className="dashboard-nav">
              <div className="flex-1">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (!iFramed) Router.push('/')
                  }}
                  className="btn"
                >
                  <LogoTextSvg className="h-10" />
                </button>
              </div>
              <div className="flex justify-end flex-1">
                <ShareBtnComponent
                  tooltipPlacement="bottom"
                  className="btn btn-white flex items-center border border-light px-6 py-1 rounded"
                />
                {/*<span className="text-xs">
                  Last Updated: {pageStore.lastUpdated?.toISOString()}
                 </span>*/}
              </div>
            </div>
          </div>

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
            <div className="dashboard-panel dashboard-place-panel">
              <div className="flex flex-shrink-0 flex-grow-0">
                <PlaceSelectComponent
                  initialValue={pageStore.selectedPlace?.length ? pageStore.selectedPlace[0] : null}
                  options={pageStore.places}
                  onChange={place => {
                    pageStore.selectedPlace = place ? [place] : []
                    pageStore.selectedPlaceDetail = place ? place : null
                  }}
                />
                {
                  pageStore.selectedPlace?.[0]?.children?.length
                    ? (
                      <PlaceSelectComponent
                        initialValue={pageStore.selectedPlace.length === 2 ? pageStore.selectedPlace[1] : null}
                        options={pageStore.selectedPlace[0].children}
                        onChange={place => {
                          pageStore.selectedPlace = place ? [pageStore.selectedPlace[0], place] : [pageStore.selectedPlace[0]]
                          pageStore.selectedPlaceDetail = place ? place : pageStore.selectedPlace[0]
                        }}
                        inputPlaceholder="Select a region"
                        className="ml-2"
                      />
                    )
                    : ''
                }
              </div>

              {
                pageStore.selectedPlaceDetail
                  ? (
                    <DashboardSelectedPlaceComponent
                      place={pageStore.selectedPlaceDetail}
                    />
                  )
                  : ''
              }
            </div>
          </div>
        </div>

        <div className="dashboard-col w-2/5">

          <div className="dashboard-panel-container">
            <div className="dashboard-panel p-0">
              <DashboardGeneralAdviceComponent />
            </div>
          </div>

          {
            // TODO: Add regionalised information for how to take action if you or a loved one are ill.
          }

          <div className="dashboard-panel-container flex-1 min-h-0">
            <div className="dashboard-panel overflow-y-scroll">
              <DashboardQuickLinksComponent />
            </div>
          </div>

          <div className="dashboard-panel-container">
            <div className="dashboard-panel p-0">
              {
                !iFramed
                  ? (
                    <ExtensionDownloadBtnComponent
                      logoClassName="h-line-lg mr-2"
                      className="dashboard-download-browser-extension btn"
                    />
                  )
                  : ''
              }
              <DashboardFooterComponent />
            </div>
          </div>

        </div>
      </main>
    )
  }
}
