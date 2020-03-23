import { Component, HTMLAttributes } from 'react'
import Link from 'next/link'
import LogoTextSvg from '../../public/icons/logo-text.svg'
import { ExtensionDownloadBtnComponent } from './extension-download-btn'
import { ShareBtnComponent } from './share-btn'

interface Props extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: string
}

export class FooterComponent extends Component<Props> {
  render () {
    const { className, maxWidth } = this.props

    const listClasses = 'flex-1 mb-4'
    const listHeaderClasses = 'font-bold text-lg mb-2'
    const listLinkClasses = 'block py-1 hover:underline hover:text-highlight'

    return (
      <footer className={`footer my-12 mx-4 lg:mx-0 ${className ?? ''}`}>
        <div className="container mx-auto" style={{ maxWidth: maxWidth ?? '1024px' }}>
          <div className="flex flex-col-reverse lg:flex-row lg:items-start">
            <div className="flex-1 mb-4">
              <div className="my-4 lg:mt-0">
                <LogoTextSvg className="h-6" />
              </div>
              <div className="text-xs mb-2">
                Made with ♥ by the team at{' '}
                <a href="https://hoobu.com" target="_blank" className="font-bold underline">
                  Hoobu
                </a>
              </div>
              <div className="text-xs">
                {/* <Link href="/terms">
                  <a className="font-bold underline hover:text-highlight" target="_blank">Terms</a>
                </Link>
                {' '}|{' '} */}
                <Link href="https://hoobu.com/privacy">
                  <a className="font-bold underline hover:text-highlight" target="_blank">Privacy</a>
                </Link>
              </div>
            </div>
            <div className="flex-1 flex flex-col lg:flex-row">
              <div className={listClasses}>
                <h2 className={listHeaderClasses}>
                  Check Out...
                </h2>
                <ul className="text-sm">
                  <li>
                    <ExtensionDownloadBtnComponent
                      className={listLinkClasses}
                    >
                      Browser Extension
                    </ExtensionDownloadBtnComponent>
                  </li>
                  <li>
                    <Link href="/dashboard">
                      <a className={listLinkClasses}>
                        Dashboard
                      </a>
                    </Link>
                  </li>
                </ul>
              </div>

              <div className={listClasses}>
                <h2 className={listHeaderClasses}>
                  Get Involved
                </h2>
                <ul className="text-sm">
                  <li className="py-1">
                    <iframe
                      src={`https://ghbtns.com/github-btn.html?user=PotentialWeb&repo=CoronaTab&type=star&count=true`}
                      scrolling="0"
                      width="80px"
                      height="20px"
                      className="mb-1"
                    />
                    <iframe
                      src={`https://ghbtns.com/github-btn.html?user=PotentialWeb&repo=CoronaTab&type=fork&count=true`}
                      scrolling="0"
                      width="80px"
                      height="20px"
                      className="mb-1"
                    />
                  </li>
                </ul>
              </div>

              <div className={`${listClasses} flex items-start lg:justify-end`}>
                <ShareBtnComponent
                  className="btn btn-white flex items-center border border-light px-6 rounded py-2"
                />
              </div>
              {/*<div className={listClasses}>
                <h2 className={listHeaderClasses}>
                  Company
                </h2>
                <ul className="text-sm">
                  <li>
                    <Link href="/about-us">
                      <a className={listLinkClasses}>About Us</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers">
                      <a className={listLinkClasses}>Careers</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/press">
                      <a className={listLinkClasses}>Press</a>
                    </Link>
                  </li>
                </ul>
              </div>*/}
            </div>
          </div>
        </div>
      </footer>
    )
  }
}
