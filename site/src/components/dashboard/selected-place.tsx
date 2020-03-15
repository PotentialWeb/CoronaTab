import { Component } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { Place } from '../../../../shared/places'
import { DashboardStatsComponent } from './stats'
import { LoadingComponent } from '../loading'
import { DashboardDailyChartComponent, DashboardCumulativeGraphComponent } from './graphs'
import { PlaceApi } from '../../utils/api/place'

interface Props {
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
  cumulativeSeriesData: any[]
  dailySeriesData: any[]
}

export class DashboardSelectedPlaceComponent extends Component<Props, State> {
  state: State = {
    loadingStatus: LoadingStatus.IS_LOADING,
    rawData: null,
    cumulativeSeriesData: null,
    dailySeriesData: null
  }

  componentDidMount () {
    this.fetchData()
  }

  componentDidUpdate (prevProps: Props) {
    if (prevProps.place?.id !== this.props.place?.id) {
      this.setState({
        rawData: null,
        cumulativeSeriesData: null,
        dailySeriesData: null
      })
      this.fetchData()
    }
  }

  fetchData = async () => {
    try {
      this.setState({ loadingStatus: LoadingStatus.IS_LOADING })
      const { data: rawData } = await PlaceApi.queryData(this.props.place.id, { compact: true })
      if (!Array.isArray(rawData)) throw new Error('rawData is not an array')
      const cumulativeSeriesData = this.parseCumulativeSeriesData(rawData)
      const dailySeriesData = this.calcDailySeriesData(rawData)
      this.setState({
        rawData,
        cumulativeSeriesData,
        dailySeriesData,
        loadingStatus: LoadingStatus.HAS_LOADED
      })
    } catch (err) {
      this.setState({ loadingStatus: LoadingStatus.HAS_ERRORED })
    }
  }

  parseCumulativeSeriesData (rawData: any[]) {
    return rawData.map(([date, cases, deaths, recovered]) => ({
      date,
      cases,
      deaths,
      recovered
    }), [])
  }

  calcDailySeriesData (rawData) {
    return rawData
      .reduce((_data, [date, cases, deaths, recovered], i, rawData) => {
        const yesterday = rawData[_data.length - 1]
        return [
          ..._data,
          {
            date,
            cases: cases - (yesterday?.[1] ?? 0),
            deaths: deaths - (yesterday?.[2] ?? 0),
            recovered: recovered - (yesterday?.[3] ?? 0)
          }
        ]
      }, [])
  }

  render () {
    return (
      <div className="dashboard-selected-place">
        {
          (() => {
            switch (this.state.loadingStatus) {
              case LoadingStatus.HAS_LOADED:
                return this.state.rawData.length > 0
                  ? (
                    <>
                      <div className="dashboard-selected-place-stats">
                        <DashboardStatsComponent
                          rawData={this.state.rawData}
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
                          <DashboardCumulativeGraphComponent data={this.state.cumulativeSeriesData} />
                        </TabPanel>
                        <TabPanel className="dashboard-selected-place-tabs-tab-panel">
                          <DashboardDailyChartComponent data={this.state.dailySeriesData} />
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
