import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { DashboardPageStore } from '../pages/dashboard.store'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import LogoTextSvg from '../../public/icons/logo-text.svg'
import { LineChartComponent } from './line-chart'
import { Meta } from '../utils/meta'
import { DashboardStatsComponent } from './dashboard/stats'
import { BarChartComponent } from './bar-chart'
import { PlaceSelectComponent } from './place-select'
import { DashboardQuickLinksComponent } from './dashboard/quick-links'

interface Props {
  pageStore?: DashboardPageStore
}

@inject('pageStore')
@observer
export class DashboardComponent extends Component<Props> {
  render () {
    return (
      <main className="dashboard">
        <div className="dashboard-stats-container">

          <div className="dashboard-nav flex items-center">
            <div className="flex-1">
              <LogoTextSvg className="h-10" />
            </div>
            <div className="flex-1 last-updated text-right">
              <span className="text-xs">
                Last Updated: {this.props.pageStore.lastUpdated?.toISOString()}
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
            rawData={[]}
          />

          <div className="region-select">
            <h2 className="font-bold">
              Select a region
            </h2>

            <div>
              <PlaceSelectComponent
                initialValue={this.props.pageStore.selectedPlace}
                options={this.props.pageStore.places}
                onChange={place => { this.props.pageStore.selectedPlace = place }}
              />
            </div>
          </div>

          {
            this.props.pageStore.selectedPlace
              ? (
                <>
                  <DashboardStatsComponent
                    title="Region Stats"
                    rawData={[]}
                  />
                  {/*<div className="region-comparison-select">
                    Compare your region with...
                      <select>
                        <option>There</option>
                      </select>
                  </div>*/}
                  <Tabs>
                    <TabList>
                      <Tab>Cumulative</Tab>
                      <Tab>Daily</Tab>
                    </TabList>

                    <TabPanel>
                      <div className="time-chart">
                        <LineChartComponent />
                      </div>
                    </TabPanel>
                    <TabPanel>
                      <div className="time-chart">
                        <BarChartComponent />
                      </div>
                    </TabPanel>
                  </Tabs>
                </>
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
            Wash dem hands.
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
