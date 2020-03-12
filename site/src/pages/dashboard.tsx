import React from 'react'
import { DashboardPageStore } from './dashboard.store'
import { Provider } from 'mobx-react'
import Tippy from '@tippy.js/react'
import LogoSvg from '../../public/icons/logo.svg'
import { LineChartComponent } from '../components/line-chart'

interface State {
  pageStore: DashboardPageStore
}

export default class DashboardPage extends React.Component<{}, State> {
  state: State = {
    pageStore: new DashboardPageStore()
  }

  render () {
    if (typeof window === 'undefined') {
      return 'Loading'
    }

    return (
      <Provider pageStore={this.state.pageStore}>
        <main>
          <LogoSvg className="h-10" />
          <div className="last-updated">
            {new Date().toISOString()}
          </div>
          <div className="global-cases">
            <div className="global-cases-infected">
              <Tippy
                content="24hr change"
                animation="shift-away"
                arrow={true}
                duration={100}
                placement="top"
              >
                <span>1290003</span>
              </Tippy>
            </div>
            <div className="global-cases-deaths">
              <Tippy
                content="24hr change"
                animation="shift-away"
                arrow={true}
                duration={100}
                placement="top"
              >
                <span>4767 (3.7%)</span>
              </Tippy>
            </div>
            <div className="global-cases-recovered">
              <Tippy
                content="24hr change"
                animation="shift-away"
                arrow={true}
                duration={100}
                placement="top"
              >
                <span>68850 (53.4%)</span>
              </Tippy>
            </div>
          </div>
          <div className="region-select">
            Select your region
            <select>
              <option>Here</option>
            </select>
          </div>
          <div className="region-comparison-select">
            Compare your region with
            <select>
              <option>There</option>
            </select>
          </div>
          <div className="region-cases">
            <div className="region-cases-infected">
              <Tippy
                content="24hr change"
                animation="shift-away"
                arrow={true}
                duration={100}
                placement="top"
              >
                <span>1290003</span>
              </Tippy>
            </div>
            <div className="region-cases-deaths">
              <Tippy
                content="24hr change"
                animation="shift-away"
                arrow={true}
                duration={100}
                placement="top"
              >
                <span>4767 (3.7%)</span>
              </Tippy>
            </div>
            <div className="region-cases-recovered">
              <Tippy
                content="24hr change"
                animation="shift-away"
                arrow={true}
                duration={100}
                placement="top"
              >
                <span>68850 (53.4%)</span>
              </Tippy>
            </div>
          </div>
          <div className="time-chart">
            <LineChartComponent />
          </div>
          <div className="local-advice">
            local advice
          </div>
          <div className="general-advice">
            swiper with general advice
          </div>
        </main>
      </Provider>
    )
  }
}
