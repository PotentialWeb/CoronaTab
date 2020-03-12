import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { DashboardPageStore } from '../pages/dashboard.store'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import LogoTextSvg from '../../public/icons/logo-text.svg'
import { LineChartComponent } from './line-chart'
import { Meta } from '../utils/meta'
import { DashboardStatsComponent } from './dashboard/stats'
import { BarChartComponent } from './bar-chart'

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
            Select your region
            <select>
              <option>Here</option>
            </select>
          </div>

          <DashboardStatsComponent
            title="Region Stats"
            rawData={[]}
          />

          <div className="region-comparison-select">
            Compare your region with...
            <select>
              <option>There</option>
            </select>
          </div>

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

          <div className="quick-links">
            <h2 className="font-bold">Quick Links</h2>
            <ul className="text-sm">
              <li>
                <a href="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/situation-reports" target="_blank">
                  WHO Daily Sit Reps
                </a>
              </li>
              <li>
                <a href="https://www.reddit.com/t/coronavirus/" target="_blank">
                  Reddit t/coronavirus
                </a>
              </li>
              <li>
                <a href="https://twitter.com/search?q=%23COVID19" target="_blank">
                  #COVID19 on Twitter
                </a>
              </li>
              <li>
                <a href="https://github.com/CSSEGISandData/COVID-19" target="_blank">
                  COVID-19 dataset on GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
      </main>
    )
  }
}
