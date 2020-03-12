import { Component, HTMLAttributes } from 'react'
import Tippy from '@tippy.js/react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string
  rawData: (string | number)[]
}

export class DashboardStatsComponent extends Component<Props> {
  get data () {
    return this.props.rawData
  }

  render () {
    return (
      <div className="dashboard-stats flex-col">
        <h2 className="font-bold">
          {this.props.title}
        </h2>
        <ul>
          <li data-type="cases">
            <Tippy
              content="24hr change"
              animation="shift-away"
              arrow={true}
              duration={100}
              placement="top"
            >
              <span>1290003</span>
            </Tippy>
          </li>
          <li>
            <Tippy
              content="24hr change"
              animation="shift-away"
              arrow={true}
              duration={100}
              placement="top"
            >
              <span>4767 (3.7%)</span>
            </Tippy>
          </li>
          <li>
            <Tippy
              content="24hr change"
              animation="shift-away"
              arrow={true}
              duration={100}
              placement="top"
            >
              <span>68850 (53.4%)</span>
            </Tippy>
          </li>
        </ul>
      </div>
    )
  }
}
