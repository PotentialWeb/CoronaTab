import { Component, HTMLAttributes } from 'react'
import Tippy from '@tippy.js/react'
import numeral from 'numeral'

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string
  rawData: (string | number)[]
}

export class DashboardStatsComponent extends Component<Props> {
  get data () {
    return this.props.rawData
  }

  render () {
    const cases = 1290003
    const deaths = 47670
    const recovered = 688500
    const deathRate = deaths / cases
    const recoveryRate = recovered / cases

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
              <span>{numeral(cases).format('0.0a')}</span>
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
              <span>
                <span>{numeral(deaths).format('0.0a')}</span>
                <span>({numeral(deathRate).format('0.00%')})</span>
              </span>
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
              <span>
                <span>{numeral(recovered).format('0.0a')}</span>
                <span>({numeral(recoveryRate).format('0.00%')})</span>
              </span>
            </Tippy>
          </li>
        </ul>
      </div>
    )
  }
}
