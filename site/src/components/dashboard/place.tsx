import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { DashboardPageStore, Place, LoadingStatus } from '../../pages/dashboard.store'
import { PlaceSelectComponent } from '../place-select'
import { DashboardCumulativeGraphComponent } from './visualizations/cumulative-graph'
import { DashboardDailyChartComponent } from './visualizations/daily-chart'
import { DashboardStatsComponent } from './stats'
import { LoadingComponent } from '../loading'

interface Props {
  pageStore?: DashboardPageStore
}

interface State {
  selectedPlace: Place
  data: {
    raw?: any,
    cumulativeSeries?: any,
    dailySeries?: any
  }
  ignoreLoadingStatus: boolean
}

@inject('pageStore')
@observer
export class DashboardPlaceComponent extends Component<Props, State> {
  state: State = (() => {
    const selectedPlace = this.props.pageStore.selectedPlace
    let data = {}
    if (this.props.pageStore.selectedPlace) {
      const rawData = this.props.pageStore.rawPlaceData?.[this.props.pageStore.selectedPlace.id]
      if (rawData) {
        data = {
          raw: rawData,
          cumulativeSeries: DashboardPageStore.parseCumulativeSeriesData(rawData),
          dailySeries: DashboardPageStore.calcDailySeriesData(rawData)
        }
      }
    }
    return {
      selectedPlace,
      data,
      ignoreLoadingStatus: Object.keys(data).length > 0
    }
  })()

  componentDidMount () {
    if (this.props.pageStore.selectedPlace) {
      this.fetchAndSetData()
    }
  }

  componentDidUpdate (prevProps: Props) {
    const { pageStore } = this.props
    if (this.state.selectedPlace?.id !== pageStore.selectedPlace?.id) {
      this.setState({ selectedPlace: pageStore.selectedPlace })
      if (pageStore.selectedPlace) {
        pageStore.selectedPlaceDataLoadingStatus = LoadingStatus.IS_LOADING
        this.fetchAndSetData()
      } else {
        this.setState({ data: {} })
      }
    }
  }

  fetchAndSetData = async () => {
    try {
      this.setState({ data: {} })
      const rawData = await this.props.pageStore.fetchSelectedPlaceData()
      const data = {
        raw: rawData,
        cumulativeSeries: DashboardPageStore.parseCumulativeSeriesData(rawData),
        dailySeries: DashboardPageStore.calcDailySeriesData(rawData)
      }
      this.setState({ data, ignoreLoadingStatus: false })
    } catch (err) {}
  }

  render () {
    const { pageStore } = this.props
    const selectedParentPlace = pageStore.selectedPlaceTree?.length > 0 ? pageStore.selectedPlaceTree[0] : null
    const selectedChildPlace = pageStore.selectedPlaceTree?.length === 2 ? pageStore.selectedPlaceTree[1] : null
    const selectedChildChildPlace = pageStore.selectedPlaceTree?.length === 3 ? pageStore.selectedPlaceTree[2] : null
    return (
      <div className="dashboard-place">
        <div className="dashboard-panel dashboard-spacer-y">
          <div className="dashboard-place-select flex flex-wrap items-center pb-2">
            {
              selectedParentPlace?.alpha2code
                ? <img src={`/flags/${selectedParentPlace.alpha2code.toLowerCase()}.svg`} className="h-line-xl my-1 mr-2" />
                : ''
            }
            <PlaceSelectComponent
              selectedPlace={selectedParentPlace}
              options={pageStore.places}
              onChange={place => {
                pageStore.selectedPlaceTree = place ? [place] : []
              }}
              className="my-1 mr-2"
            />
            {(() => {
              if (!selectedParentPlace?.children?.length) return ''
              return (<PlaceSelectComponent
                selectedPlace={selectedChildPlace}
                options={selectedParentPlace.children}
                onChange={place => {
                  pageStore.selectedPlaceTree = place ? [selectedParentPlace, place] : [selectedParentPlace]
                }}
                inputPlaceholder="Select a region"
                className="my-1 mr-2"
              />)
            })()}
            {(() => {
              if (!selectedChildPlace?.children?.length) return ''
              return (<PlaceSelectComponent
                selectedPlace={selectedChildChildPlace}
                options={selectedChildPlace.children}
                onChange={place => {
                  pageStore.selectedPlaceTree = place ? [selectedParentPlace, selectedChildPlace, place] : [selectedParentPlace, selectedChildPlace]
                }}
                inputPlaceholder="Select a place"
                className="my-1 mr-2"
              />)
            })()}
          </div>

          <div className="dashboard-place-stats">
            <DashboardStatsComponent
              rawData={this.state.data?.raw}
              className="pl-2"
            />
          </div>

          {
            (() => {
              if (!pageStore.selectedPlace) return ''

              const visualizations = (
                <div className="dashboard-place-visualizations flex flex-row flex-wrap min-w-0">
                  <div className="w-full xl:w-1/2 4xl:w-1/3 dashboard-spacer">
                    <DashboardCumulativeGraphComponent
                      data={this.state.data?.cumulativeSeries}
                    />
                  </div>
                  <div className="w-full xl:w-1/2 4xl:w-1/3 dashboard-spacer">
                    <DashboardDailyChartComponent
                      data={this.state.data?.dailySeries}
                    />
                  </div>
                </div>
              )

              if (this.state.ignoreLoadingStatus) {
                return visualizations
              }

              switch (pageStore.selectedPlaceDataLoadingStatus) {
                case LoadingStatus.HAS_LOADED:
                  return this.state.data.raw?.length > 0
                    ? visualizations
                    : (
                      <div className="my-2 flex items-center">
                        No data for this place
                      </div>
                    )
                case LoadingStatus.HAS_ERRORED:
                  return (
                    <div>
                      <button onClick={this.fetchAndSetData}>
                        Try again
                      </button>
                    </div>
                  )
                case LoadingStatus.IS_LOADING:
                  return (
                    <div className="dashboard-spacer flex items-center justify-center h-24">
                      <LoadingComponent className="h-8 ml-2" />
                    </div>
                  )
              }
            })()
          }
        </div>
      </div>
    )
  }
}
