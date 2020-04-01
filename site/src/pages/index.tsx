import { Component } from 'react'
import Link from 'next/link'
import { Meta } from '../utils/meta'
import ArrowRightSvg from '../../public/icons/arrow-right.svg'
import ExternalLinkSvg from '../../public/icons/external-link.svg'
import LogoTextSvg from '../../public/icons/logo-text.svg'
import { ExtensionDownloadBtnComponent } from '../components/extension-download-btn'
import { FooterComponent } from '../components/footer'
import { inject, observer } from 'mobx-react'
import { AppStore } from './_app.store'

interface Props {
  appStore: AppStore
}

@inject('appStore')
@observer
export default class IndexPage extends Component<Props> {
  render () {
    const { appStore } = this.props
    const { t } = appStore
    return (
      <main data-page="index">
        <header className="pt-4 sm:pt-10 pb-16 md:pt-12 3xl:pt-16">
          <div className="container mx-auto" style={{ maxWidth: '1024px' }}>
            <div className="flex flex-col lg:flex-row px-4 lg:p-0">
              <div className="w-full lg:w-1/2">
                <LogoTextSvg className="h-10 mt-2 mb-8" />
                <h1 className="font-bold mt-8 mb-6 text-6xl leading-none">
                  {t('open-source')}<br />{t('coronavirus')}<br /> {t('data-platform')}
                </h1>
                <h3 className="font-bold mb-6 text-xl text-brand-light" style={{ maxWidth: '90%' }}>
                  #coronatab #COVID19
                </h3>
                <h2 className="font-bold mb-6 text-lg text-brand-light" style={{ maxWidth: '90%' }}>
                  {Meta.DESCRIPTION}
                </h2>
                <div className="my-2">
                  <Link href="dashboard">
                    <a
                      rel={`${Meta.APP_NAME} dashboard`}
                      className="inline-flex items-center btn btn-white border-2 border-lighter px-6 py-4 text-xl rounded"
                    >
                      <span>{t('go-to-the-dashboard')}</span>
                      <ArrowRightSvg className="h-line ml-3" />
                    </a>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center my-2">
                  <div className="inline-flex">
                    <ExtensionDownloadBtnComponent
                      logoClassName="h-line-lg mr-2"
                      className="flex btn btn-white border-2 border-lighter px-4 py-3 mr-2 rounded my-1"
                    />
                  </div>
                  <div className="inline-flex">
                    <a
                      href="https://github.com/PotentialWeb/CoronaTab/wiki/RESTful-API-documentation"
                      target="_blank"
                      className="flex items-center btn btn-white border-2 border-lighter px-4 py-3 rounded my-1"
                    >
                      <span>REST API {t('documentation')}</span>
                      <ExternalLinkSvg className="h-line-sm ml-2" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="my-12 lg:ml-12">
                  <img
                    src="/graphics/main.svg"
                    alt={Meta.STRAPLINE}
                    className="mx-auto h-auto"
                    style={{ width: '600px', maxWidth: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>
        <FooterComponent />
      </main>
    )
  }
}
