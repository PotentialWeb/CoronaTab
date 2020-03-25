import { PureComponent } from 'react'
import Downshift from 'downshift'
import { observer, inject } from 'mobx-react'
import { DashboardPageStore, Place } from '../../../pages/dashboard.store'
import Tippy from '@tippyjs/react'
import CaretDownSvg from '../../../../public/icons/caret-down.svg'
import CaretUpSvg from '../../../../public/icons/caret-up.svg'
import get from 'lodash.get'
import numeral from 'numeral'

interface Props {
  pageStore?: DashboardPageStore
}

enum LeaderboardTypeId {
  MOST_CASES = 'mostCases',
  MOST_CASES_AS_PERCENTAGE_OF_POPULATION = 'mostCasesAsPercentageOfPopulation',
  MOST_DEATHS = 'mostDeaths',
  MOST_DEATHS_AS_PERCENTAGE_OF_POPULATION = 'mostDeathsAsPercentageOfPopulation',
  HIGHEST_DEATH_RATE = 'highestDeathRate',
  LOWEST_DEATH_RATE = 'lowestDeathRate',
  HIGHEST_RECOVERY_RATE = 'highestRecoveryRate',
  LOWEST_RECOVERY_RATE = 'lowestRecoveryRate'
}

interface LeaderboardType {
  id: LeaderboardTypeId
  label: string
  accessor: string
  sortBy?: 'desc' | 'asc'
  formatter?: (value: number) => string
  filter?: (place: Place) => boolean
}

const leaderboardTypes: LeaderboardType[] = [{
  id: LeaderboardTypeId.MOST_CASES,
  label: 'Most Cases',
  accessor: 'latestData.cases',
  formatter: (value: number) => numeral(value).format(value >= 1000 ? '0.[0]a' : '0,0')
}, {
  id: LeaderboardTypeId.MOST_CASES_AS_PERCENTAGE_OF_POPULATION,
  label: 'Most Cases % Population',
  accessor: 'latestData.casesAsPercentageOfPopulation',
  formatter: (value: number) => numeral(value).format('0.000%')
}, {
  id: LeaderboardTypeId.MOST_DEATHS,
  label: 'Most Deaths',
  accessor: 'latestData.deaths',
  formatter: (value: number) => numeral(value).format(value >= 1000 ? '0.[0]a' : '0,0')
}, {
  id: LeaderboardTypeId.MOST_DEATHS_AS_PERCENTAGE_OF_POPULATION,
  label: 'Most Deaths % Population',
  accessor: 'latestData.deathsAsPercentageOfPopulation',
  formatter: (value: number) => numeral(value).format('0.000%')
}, {
  id: LeaderboardTypeId.HIGHEST_DEATH_RATE,
  label: 'Highest Death Rate',
  accessor: 'latestData.deathRate',
  formatter: (value: number) => numeral(value).format('0.000%')
}, {
  id: LeaderboardTypeId.LOWEST_DEATH_RATE,
  label: 'Lowest Death Rate',
  accessor: 'latestData.deathRate',
  sortBy: 'asc',
  formatter: (value: number) => numeral(value).format('0.000%'),
  filter: (place: Place) => place.latestData.deathRate > 0
}, {
  id: LeaderboardTypeId.HIGHEST_RECOVERY_RATE,
  label: 'Highest Recovery Rate',
  accessor: 'latestData.recoveryRate',
  formatter: (value: number) => numeral(value).format('0.000%')
}, {
  id: LeaderboardTypeId.LOWEST_RECOVERY_RATE,
  label: 'Lowest Recovery Rate',
  accessor: 'latestData.recoveryRate',
  sortBy: 'asc',
  formatter: (value: number) => numeral(value).format('0.000%'),
  filter: (place: Place) => place.latestData.recoveryRate > 0
}]

interface State {
  leaderboardTypeId?: LeaderboardTypeId
  data?: any
}

@inject('pageStore')
@observer
export class DashboardGlobalCountryLeaderboardComponent extends PureComponent<Props, State> {
  state: State = {
    leaderboardTypeId: LeaderboardTypeId.MOST_CASES
  }

  render () {
    const { pageStore } = this.props

    const leaderboardType = leaderboardTypes.find(({ id }) => id === this.state.leaderboardTypeId)

    const leaderboardTypeSelect = (
      <Downshift
        selectedItem={leaderboardType}
        onChange={(leaderboardType: LeaderboardType) => this.setState({ leaderboardTypeId: leaderboardType.id })}
        itemToString={(leaderboardType: LeaderboardType) => leaderboardType?.label}
      >
        {({
          getItemProps,
          getMenuProps,
          selectedItem,
          isOpen,
          highlightedIndex,
          getRootProps,
          setState
        }) => (
          <div className="select">
            <Tippy
              visible={isOpen}
              animation="shift-away"
              theme="light"
              className="select-list-tooltip"
              allowHTML={true}
              content={(
                <ul
                  {...getMenuProps({}, { suppressRefError: true })}
                  className="select-list"
                >
                  {
                    isOpen
                      ? leaderboardTypes
                        .map((leaderboardType, index) => {
                          return (
                            <li
                              key={index}
                              {...getItemProps({
                                index,
                                item: leaderboardType
                              })}
                              data-highlighted={highlightedIndex === index}
                              className="select-list-item"
                            >
                              <span className="font-bold">{leaderboardType.label}</span>{' '}
                            </li>
                          )
                        })
                      : ''
                  }
                </ul>
              )}
              arrow={true}
              placement="bottom-start"
              duration={100}
              maxWidth="none"
              onHidden={() => setState({ isOpen: false })}
              interactive
            >
              <div
                {...getRootProps({} as any, { suppressRefError: true })}
                className="select-input-area"
              >
                <button
                  className="btn btn-white flex items-center border border-light rounded-sm px-2 py-1 text-lg font-bold"
                  onClick={() => setState({ isOpen: true })}
                >
                  <span className="mr-2">{selectedItem.label}</span>
                  {
                    isOpen
                      ? (<CaretUpSvg className="h-line-sm" />)
                      : (<CaretDownSvg className="h-line-sm" />)
                  }
                </button>
              </div>
            </Tippy>
          </div>
        )}
      </Downshift>
    )

    return (
      <div className="dashboard-panel select-none">
        <div className="flex flex-col md:flex-row md:items-center mb-2">
          <div className="flex-shrink-0">
            {leaderboardTypeSelect}
          </div>
          {/*<div className="flex items-center justify-end flex-shrink-0 flex-grow-0">
            <div>

            </div>
          </div>*/}
        </div>
        <div>
          {(() => {
            const { accessor, formatter, filter, sortBy } = leaderboardType

            let places = [...pageStore.places]

            if (typeof filter === 'function') places = places.filter(filter)

            places = places.sort((a, b) => get(a, accessor) - get(b, accessor))

            if (sortBy !== 'asc') places.reverse()

            return places
              .slice(0,10)
              .map((place) => {
                return (
                  <div key={place.id} className="flex flex-row min-w-0">
                    <div className="flex flex-1 items-center font-bold">
                      {
                        place.alpha2code
                          ? <img src={`/flags/${place.alpha2code.toLowerCase()}.svg`} className="h-line mr-2" />
                          : ''
                      }
                      <span className="truncate">
                        {place.name}
                      </span>
                    </div>
                    <div className="flex flex-1 justify-end ">
                      <span className="font-bold text-lg">{formatter(get(place, accessor))}</span>
                    </div>
                  </div>
                )
              })
          })()}
        </div>
      </div>
    )
  }
}
