import { Component, HTMLAttributes } from 'react'
import Tippy from '@tippyjs/react'
import numeral from 'numeral'
import CaretUpSvg from '../../../public/icons/caret-up.svg'
import CaretDownSvg from '../../../public/icons/caret-down.svg'

interface Props extends HTMLAttributes<HTMLDivElement> {
  title?: string
  rawData: (string | number)[]
}

export class DashboardStatsComponent extends Component<Props> {
  render () {
    const {
      title,
      rawData,
      className = '',
      ...props
    } = this.props

    if (!rawData) return ''

    const latestSnapshot = rawData[rawData.length - 1]
    if (!latestSnapshot) return ''

    const cases = latestSnapshot[1]
    const deaths = latestSnapshot[2]
    const recovered = latestSnapshot[3]
    const deathRate = deaths / cases
    const recoveryRate = recovered / cases
    const penultimateSnapshot = rawData[rawData.length - 2]

    const calcDifference = (oldValue, newValue) => {
      const value = (newValue - oldValue) / oldValue
      return isFinite(value) ? value : (value === Number.NEGATIVE_INFINITY ? -1 : 1)
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
      <div className={`dashboard-stats ${className}`} {...props}>
        {
          title
            ? (
              <h2 className="font-bold">
                {title}
              </h2>
            )
            : ''
        }
        <ul>
          <li data-type="cases">
            <h3>Cases</h3>
            <div>
              <Tippy
                content={`Total Cases: ${numeral(cases).format('0,0')}`}
                {...tippyProps}
              >
                <span data-metric="total">{numeral(cases).format(cases > 1000 ? '0.0a' : '0,0')}</span>
              </Tippy>
              <aside>
                {
                  Array.isArray(diffs.cases) ? (
                    <Tippy
                      content={`${penultimateSnapshot[0]}: ${numeral(diffs.cases[0]).format('0,0')} | Now: ${numeral(cases).format('0,0')}`}
                      {...tippyProps}
                    >
                      <span data-metric="24hr" className="flex items-center">
                        {(() => {
                          if (diffs.cases[1] === 0) return ''
                          const metric = (<span style={{ marginLeft: '0.2em'}}>
                            {numeral(diffs.cases[1]).format('0.00%')}
                          </span>)
                          const svg = diffs.cases[1] > 0
                            ? <CaretUpSvg className="h-line text-red inline-block" />
                            : <CaretDownSvg className="h-line inline-block" />
                          return (<>{svg}{metric}</>)
                        })()}
                      </span>
                    </Tippy>
                  ) : ''
                }
              </aside>
            </div>
          </li>
          <li data-type="deaths">
            <h3>Deaths</h3>
            <div>
              <Tippy
                content={`Total Deaths: ${numeral(deaths).format('0,0')}`}
                {...tippyProps}
              >
                <span data-metric="total">{numeral(deaths).format(deaths > 1000 ? '0.0a' : '0,0')}</span>
              </Tippy>
              <aside>
                <Tippy
                  content={`Death rate: ${numeral(deathRate).format('0.000%')}`}
                  {...tippyProps}
                >
                  <span data-metric="rate">({numeral(deathRate).format('0.0%')})</span>
                </Tippy>
                {
                  Array.isArray(diffs.deaths) ? (
                    <Tippy
                      content={`${penultimateSnapshot[0]}: ${numeral(diffs.deaths[0]).format('0,0')} | Now: ${numeral(deaths).format('0,0')}`}
                      {...tippyProps}
                    >
                    <span data-metric="24hr" className="flex items-center">
                      {(() => {
                        if (diffs.deaths[1] === 0) return ''
                        const metric = (<span style={{ marginLeft: '0.2em'}}>
                          {numeral(diffs.deaths[1]).format('0.00%')}
                        </span>)
                        const svg = diffs.deaths[1] > 0
                          ? <CaretUpSvg className="h-line text-red inline-block" />
                          : <CaretDownSvg className="h-line inline-block" />
                        return (<>{svg}{metric}</>)
                      })()}
                    </span>
                    </Tippy>
                  ) : ''
                }
              </aside>
            </div>
          </li>
          <li data-type="recovered">
            <h3>Recovered</h3>
            <div>
              <Tippy
                content={`Total Recovered: ${numeral(recovered).format('0,0')}`}
                {...tippyProps}
              >
                <span data-metric="total">{numeral(recovered).format(recovered > 1000 ? '0.0a' : '0,0')}</span>
              </Tippy>
              <aside>
                <Tippy
                  content={`Recovery rate: ${numeral(recoveryRate).format('0.000%')}`}
                  {...tippyProps}
                >
                  <span data-metric="rate">({numeral(recoveryRate).format('0.0%')})</span>
                </Tippy>
                {
                  Array.isArray(diffs.recovered) ? (
                    <Tippy
                      content={`${penultimateSnapshot[0]}: ${numeral(diffs.recovered[0]).format('0,0')} | Now: ${numeral(recovered).format('0,0')}`}
                      {...tippyProps}
                    >
                      <span data-metric="24hr" className="flex items-center">
                        {(() => {
                          if (diffs.recovered[1] === 0) return ''
                          const metric = (<span style={{ marginLeft: '0.2em'}}>
                            {numeral(diffs.recovered[1]).format('0.00%')}
                          </span>)
                          const svg = diffs.recovered[1] > 0
                            ? <CaretUpSvg className="h-line text-green inline-block" />
                            : <CaretDownSvg className="h-line inline-block" />
                          return (<>{svg}{metric}</>)
                        })()}
                      </span>
                    </Tippy>
                  ) : ''
                }
              </aside>
            </div>
          </li>
        </ul>
      </div>
    )
  }
}
