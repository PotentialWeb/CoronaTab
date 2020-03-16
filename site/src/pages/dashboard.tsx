import React from 'react'
import { Provider, observer } from 'mobx-react'
import { DashboardPageStore, LoadingStatus } from './dashboard.store'
import { DashboardComponent } from '../components/dashboard'
import { LoadingComponent } from '../components/loading'

interface State {
  pageStore: DashboardPageStore
}

@observer
export default class DashboardPage extends React.Component<{}, State> {
  state: State = {
    pageStore: new DashboardPageStore()
  }

  componentDidMount () {
    this.state.pageStore.init()
  }

  componentWillUnmount () {
    this.state.pageStore.destroy()
  }

  render () {
    const { pageStore } = this.state

    return (
      <Provider pageStore={pageStore}>
        {(() => {
          switch (pageStore.loadingStatus) {
            case LoadingStatus.HAS_LOADED:
              return <DashboardComponent />
            case LoadingStatus.IS_LOADING:
              return (
                <div className="h-screen w-screen flex flex-col items-center justify-center">
                  <LoadingComponent className="h-16" />
                  <span className="font-bold text-xl mt-1">CoronaTab</span>
                </div>
              )
            case LoadingStatus.HAS_ERRORED:
              return 'Errored'
          }
        })()}
      </Provider>
    )
  }
}
