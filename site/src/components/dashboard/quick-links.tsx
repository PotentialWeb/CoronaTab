import { Component } from "react"
import QuickLinks from '../../../public/data/quick-links.json'
import { LocalStorage } from '../../utils/storage'
import { ExtensionDownloadBtnComponent } from "../extension-download-btn"

export class DashboardQuickLinksComponent extends Component {
  render () {
    const locale = LocalStorage.get('locale')
    const iFramed = window?.self !== window?.top

    return (
      <div className="dashboard-quick-links">
        <h2 className="font-bold mb-3">Quick Links</h2>
        <ul>
          {
            !iFramed ? (
              <li>
                <ExtensionDownloadBtnComponent
                  logoClassName="h-line-lg mr-2"
                  className="btn btn-white dashboard-quick-links-btn"
                />
              </li>
            ) : ''
          }
          {
            QuickLinks.length ? (
              <>
                {QuickLinks.map(({ url, title, icon }) => {
                  const t = title[locale] ?? title['en']
                  return (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank" rel={t}
                        className="btn btn-white dashboard-quick-links-btn"
                      >
                        <div className="dashboard-quick-links-btn-logo">
                          {
                            icon
                              ? <img src={icon} className="h-line" />
                              : ''
                          }
                        </div>
                        {t}
                      </a>
                    </li>
                  )
                })}
              </>
            ) : (
              <div>
                No quick links
              </div>
            )
          }
        </ul>
      </div>
    )
  }
}
