import { Component } from 'react'
import { Link } from '../utils/i18n'
import { inject, observer } from 'mobx-react'
import { AppStore } from '../pages/_app.store'
import { DashboardQuickLinksComponent } from './dashboard/quick-links'
import { DashboardGeneralAdviceComponent } from './dashboard/general-advice'
import { ShareBtnComponent } from './share-btn'
import { DashboardGlobalComponent } from './dashboard/global'
import { DashboardPlaceComponent } from './dashboard/place'
import LogoTextSvg from '../../public/icons/logo-text.svg'
import ExternalLinkSvg from '../../public/icons/external-link.svg'
import { LanguageSelectComponent } from './language-select'

interface Props {
  appStore?: AppStore
}

@inject('appStore')
@observer
export class DashboardComponent extends Component<Props> {
  render () {
    const { appStore } = this.props
    const { t } = appStore
    const iFramed = window?.self !== window?.top
    return (
      <div className="dashboard">
        <div className="dashboard-content">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <a target={iFramed ? '_blank' : null} className="btn inline-block">
                  <LogoTextSvg className="h-10" />
                </a>
              </Link>
            </div>
            <div className="flex-1 flex justify-end items-center">
              <LanguageSelectComponent />
            </div>
          </div>

          <div className="dashboard-spacer-y">
            <DashboardGlobalComponent />
          </div>
          <div className="dashboard-spacer-y">
            <DashboardPlaceComponent />
          </div>

        </div>

        <div className="dashboard-aside">
          <div className="dashboard-aside-sticky">
            <div className="flex justify-end flex-1">
              <div className="flex items-center flex-shrink-0 flex-grow-0">
                <iframe
                  src={`https://ghbtns.com/github-btn.html?user=PotentialWeb&repo=CoronaTab&type=star&count=true`}
                  scrolling="0"
                  width="80px"
                  height="20px"
                  className="inline-block"
                />
                <iframe
                  src={`https://ghbtns.com/github-btn.html?user=PotentialWeb&repo=CoronaTab&type=fork&count=true`}
                  scrolling="0"
                  width="80px"
                  height="20px"
                  className="inline-block mr-2"
                />
              </div>
              <div className="flex-shrink-0 flex-grow-0">
                <ShareBtnComponent
                  tooltipPlacement="bottom"
                  className="btn btn-white flex items-center border border-light px-6 py-1 rounded"
                />
              </div>
            </div>

            <div className="dashboard-spacer-y">
              <div className="dashboard-panel p-0">
                <DashboardGeneralAdviceComponent />
              </div>
            </div>

            <div className="dashboard-spacer-y">
              <a href="https://hoobu.com" target="_blank" className="dashboard-panel p-0">
                <div
                  style={{ transition: 'background-color .2s' }}
                  className="px-4 py-3 bg-brand-light hover:bg-brand-lighter text-white rounded-lg leading-tight font-bold"
                >
                  <span className="text-sm mr-4">
                    {t('promo-message')}
                    <ExternalLinkSvg className="inline-block h-line ml-2" />
                  </span>
                </div>
              </a>
            </div>

            <div className="dashboard-spacer">
              <DashboardQuickLinksComponent />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
