import { Component } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { Place } from '@coronatab/shared'
import { DashboardStatsComponent } from './stats'
import { LoadingComponent } from '../loading'
import { DashboardDailyChartComponent, DashboardCumulativeGraphComponent } from './visualizations'
import { PlaceApi } from '../../utils/api/place'
import { inject, observer } from 'mobx-react'
import { DashboardPageStore } from '../../pages/dashboard.store'
import { computed } from 'mobx'

interface Props {
  pageStore?: DashboardPageStore
  place: Place
}

export enum LoadingStatus {
  IS_LOADING = 'isLoading',
  HAS_LOADED = 'hasLoaded',
  HAS_ERRORED = 'hasErrored'
}

interface State {
  loadingStatus: LoadingStatus
  rawData: any[]
}

@inject('pageStore')
@observer
export class DashboardSelectedPlaceComponent extends Component<Props, State> {
  state: State = {
    loadingStatus: LoadingStatus.IS_LOADING,
    rawData: []
  }

  componentDidMount () {
    this.fetchData()
  }

  componentDidUpdate (prevProps: Props) {
    if (prevProps.place?.id !== this.props.place?.id) {
      this.setState({
        rawData: null
      })
      this.fetchData()
    }
  }

  fetchData = async () => {
    try {
      this.setState({ loadingStatus: LoadingStatus.IS_LOADING })
      const { data: rawData } = await PlaceApi.queryData(this.props.place.id, { compact: true })
      if (!Array.isArray(rawData)) throw new Error('rawData is not an array')
      this.setState({
        rawData,
        loadingStatus: LoadingStatus.HAS_LOADED
      })
    } catch (err) {
      this.setState({ loadingStatus: LoadingStatus.HAS_ERRORED })
    }
  }

  @computed
  get filteredRawData () {
    const { startDate, endDate } = this.props.pageStore
    return startDate && endDate
      ? DashboardPageStore.filterRawDataByDates(this.state.rawData, startDate, endDate)
      : this.state.rawData
  }

  @computed
  get cumulativeSeriesData () {
    return DashboardPageStore.parseCumulativeSeriesData(this.filteredRawData)
  }

  @computed
  get dailySeriesData () {
    return DashboardPageStore.calcDailySeriesData(this.filteredRawData)
  }

  render () {
    return (
      <div className="dashboard-selected-place">
        {
          (() => {
            switch (this.state.loadingStatus) {
              case LoadingStatus.HAS_LOADED:
                return this.filteredRawData.length > 0
                  ? (
                    <>
                      <div className="dashboard-selected-place-stats">
                        <DashboardStatsComponent
                          rawData={this.filteredRawData}
                        />
                      </div>

                      <Tabs
                        className="dashboard-selected-place-tabs"
                        selectedTabPanelClassName="dashboard-selected-place-tabs-tab-panel-selected"
                      >
                        <TabList>
                          <Tab>Cumulative</Tab>
                          <Tab>Daily</Tab>
                        </TabList>
                        <TabPanel
                          className="dashboard-selected-place-tabs-tab-panel"
                        >
                          <DashboardCumulativeGraphComponent
                            data={this.cumulativeSeriesData}
                          />
                        </TabPanel>
                        <TabPanel className="dashboard-selected-place-tabs-tab-panel">
                          <DashboardDailyChartComponent
                            data={this.dailySeriesData}
                          />
                        </TabPanel>
                      </Tabs>
                    </>
                  )
                  : (
                    <div className="my-2 flex items-center">
                      No data for this place
                    </div>
                  )
              case LoadingStatus.HAS_ERRORED:
                return (
                  <div>
                    <button onClick={this.fetchData}>
                      Try again
                    </button>
                  </div>
                )
              case LoadingStatus.IS_LOADING:
                return (
                  <div className="my-2">
                    <LoadingComponent className="h-8 ml-2" />
                  </div>
                )
            }
          })()
        }

      </div>
    )
  }
}
