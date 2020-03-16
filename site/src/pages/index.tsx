import { Component } from 'react'
import Link from 'next/link'
import { Meta } from '../utils/meta'
import LogoTextSvg from '../../public/icons/logo-text.svg'
import { ExtensionDownloadBtnComponent } from '../components/extension-download-btn'
import { FooterComponent } from '../components/footer'

export default class IndexPage extends Component {
  render () {
    return (
      <main data-page="index">
        <header className="pt-4 sm:pt-10 pb-16 md:pt-12 3xl:pt-16">
          <div className="container mx-auto" style={{ maxWidth: '1024px' }}>
            <div className="flex flex-col lg:flex-row px-4 lg:p-0">
              <div className="w-full lg:w-1/2">
                <LogoTextSvg className="h-10 mt-2 mb-8" />
                <h1 className="font-bold mt-8 mb-6 text-6xl leading-none">
                  Launchpad for<br /> Coronavirus<br /> stats &amp; news
                </h1>
                <h3 className="font-bold mb-6 text-xl text-brand-light" style={{ maxWidth: '90%' }}>
                  #coronatab #COVID19
                </h3>
                <h2 className="font-bold mb-6 text-lg text-brand-light" style={{ maxWidth: '90%' }}>
                  {Meta.STRAPLINE}
                </h2>
                <div className="my-3">
                  <ExtensionDownloadBtnComponent
                    logoClassName="h-line-xl mr-2"
                    className="inline-flex items-center btn btn-white border-2 border-lighter px-6 py-4 text-xl rounded"
                  />
                </div>
                <div className="my-3">
                  <Link href="dashboard">
                    <a
                      rel={`${Meta.APP_NAME} dashboard`}
                      className="inline-flex btn btn-white border-2 border-lighter px-6 py-3 rounded"
                    >
                      View the dashboard
                    </a>
                  </Link>
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
