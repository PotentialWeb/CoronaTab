import { Component } from 'react'
import Link from 'next/link'
import { inject, observer } from 'mobx-react'
import { DashboardPageStore } from '../pages/dashboard.store'
import { DashboardStatsComponent } from './dashboard/stats'
import { DashboardQuickLinksComponent } from './dashboard/quick-links'
import { DashboardGeneralAdviceComponent } from './dashboard/general-advice'
import { ShareBtnComponent } from './share-btn'
import LogoTextSvg from '../../public/icons/logo-text.svg'
import { DashboardPlaceComponent } from './dashboard/place'
// import { StickyContainer, Sticky } from 'react-sticky'

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
      <div className="dashboard">
        <div className="dashboard-content">
          <Link href="/">
            <a target={iFramed ? '_blank' : null} className="btn">
              <LogoTextSvg className="h-10" />
            </a>
          </Link>
          {
            pageStore.rawGlobalData.length
              ? (
                <div className="dashboard-spacer-y">
                  <div className="dashboard-panel dashboard-global-stats-panel">
                    <DashboardStatsComponent
                      title="Global Stats"
                      rawData={pageStore.rawGlobalData}
                      style={{ maxWidth: '750px'}}
                    />
                  </div>
                </div>
              )
              : ''
          }
          <div className="dashboard-spacer-y">
            <DashboardPlaceComponent />
          </div>
          <div style={{ height: '1300vh'}} />
        </div>

        <div className="dashboard-aside">
          <div className="dashboard-aside-sticky">
            <div className="flex justify-end flex-1">
              <div className="flex items-center flex-shrink-0 flex-grow-0">
                <span className="text-xs mr-4">
                  Made with ♥ by the team at{' '}
                  <a href="https://hoobu.com" target="_blank" className="font-bold underline">
                    Hoobu
                  </a>
                </span>
                <iframe
                  src={`https://ghbtns.com/github-btn.html?user=PotentialWeb&repo=CoronaTab&type=star&count=true`}
                  scrolling="0"
                  width="80px"
                  height="20px"
                  className="inline-block"
                />
                <iframe
                  src={`https://ghbtns.com/github-btn.html?user=PotentialWeb&repo=CoronaTab&type=fork&count=true`}
                  scrolling="0"
                  width="80px"
                  height="20px"
                  className="inline-block mr-2"
                />
              </div>
              <div className="flex-shrink-0 flex-grow-0">
                <ShareBtnComponent
                  tooltipPlacement="bottom"
                  className="btn btn-white flex items-center border border-light px-6 py-1 rounded"
                />
              </div>
              {/*<span className="text-xs">
                Last Updated: {pageStore.lastUpdated?.toISOString()}
              </span>*/}
            </div>

            <div className="dashboard-spacer-y">
              <div className="dashboard-panel p-0">
                <DashboardGeneralAdviceComponent />
              </div>
            </div>

            {
              // TODO: Add regionalised information for how to take action if you or a loved one are ill.
            }

            <div className="dashboard-spacer">
              <DashboardQuickLinksComponent />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
