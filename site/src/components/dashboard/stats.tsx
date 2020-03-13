import { Component, HTMLAttributes } from 'react'
import Tippy from '@tippy.js/react'
import numeral from 'numeral'

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string
  rawData: (string | number)[]
}

export class DashboardStatsComponent extends Component<Props> {
  render () {
    const { rawData } = this.props
    const latestSnapshot = rawData[rawData.length - 1]
    const cases = latestSnapshot[1]
    const deaths = latestSnapshot[2]
    const recovered = latestSnapshot[3]
    const deathRate = deaths / cases
    const recoveryRate = recovered / cases
    const penultimateSnapshot = rawData[rawData.length - 2]

    const calcDifference = (oldValue, newValue) => {
      const value = (newValue - oldValue) / oldValue
      return isFinite(value) ? value : 1
    }

    let diffs = { cases: null, deaths: null, recovered: null }

    if (penultimateSnapshot) {
      diffs.cases = [
        penultimateSnapshot[1],
        calcDifference(penultimateSnapshot[1], cases)
      ]
      diffs.deaths = [
        penultimateSnapshot[2],
        calcDifference(penultimateSnapshot[2], deaths)
      ]
      diffs.recovered = [
        penultimateSnapshot[3],
        calcDifference(penultimateSnapshot[3], recovered)
      ]
    }

    const tippyProps = {
      animation: 'shift-away',
      arrow: true,
      duration: 100,
      placement: 'top' as 'top'
    }

    return (
      <div className="dashboard-stats flex-col">
        <h2 className="font-bold">
          {this.props.title}
        </h2>
        <ul>
          <li data-type="cases">
            <Tippy
              content="Total Cases"
              {...tippyProps}
            >
              <span>{numeral(cases).format('0.0a')}</span>
            </Tippy>
            {
              Array.isArray(diffs.cases) ? (
                <Tippy
                  content={`${diffs.cases[0]} -> ${cases}`}
                  {...tippyProps}
                >
                  <span>{numeral(diffs.cases[1]).format('+0.00%')}</span>
                </Tippy>
              ) : ''
            }
          </li>
          <li>
            <Tippy
              content="Total Deaths"
              {...tippyProps}
            >
              <span>{numeral(deaths).format('0.0a')}</span>
            </Tippy>
            <Tippy
              content="Death rate"
              {...tippyProps}
            >
              <span>({numeral(deathRate).format('0.00%')})</span>
            </Tippy>
            {
              Array.isArray(diffs.deaths) ? (
                <Tippy
                  content={`${diffs.deaths[0]} > ${deaths}`}
                  {...tippyProps}
                >
                  <span>{numeral(diffs.deaths[1]).format('+0.00%')}</span>
                </Tippy>
              ) : ''
            }
          </li>
          <li>
            <Tippy
              content="Total Recovered"
              {...tippyProps}
            >
              <span>{numeral(recovered).format('0.0a')}</span>
            </Tippy>
            <Tippy
              content="Recovery rate"
              {...tippyProps}
            >
              <span>({numeral(recoveryRate).format('0.00%')})</span>
            </Tippy>
            {
              Array.isArray(diffs.recovered) ? (
                <Tippy
                  content={`${diffs.recovered[0]} -> ${recovered}`}
                  {...tippyProps}
                >
                  <span>{numeral(diffs.recovered[1]).format('+0.00%')}</span>
                </Tippy>
              ) : ''
            }
          </li>
        </ul>
      </div>
    )
  }
}
