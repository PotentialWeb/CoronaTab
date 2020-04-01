import React from 'react'
import { Provider, observer } from 'mobx-react'
import { DashboardPageStore, LoadingStatus } from './dashboard.store'
import { DashboardComponent } from '../components/dashboard'
import { LoadingComponent } from '../components/loading'
import { WithTranslation } from 'next-i18next'
import { withTranslation } from '../utils/i18n'

interface Props extends WithTranslation {}

interface State {
  pageStore: DashboardPageStore
}

@observer
class DashboardPage extends React.Component<Props, State> {
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
    const { t } = this.props
    const { pageStore } = this.state

    return (
      <Provider pageStore={pageStore}>
        <main data-page="dashboard">
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
                return (
                  <div className="h-screen w-screen flex flex-col items-center justify-center">
                    <LoadingComponent className="h-16" />
                <span className="font-bold text-xl mt-1 mb-2">{t('service-unavailable')}</span>
                    <button
                      onClick={() => window.location.reload()}
                      className="btn btn-white border-2 border-light rounded px-3 py-1"
                    >
                      {t('try-again')}
                    </button>
                  </div>
                )
            }
          })()}
        </main>
      </Provider>
    )
  }
}

export default withTranslation()(DashboardPage)
