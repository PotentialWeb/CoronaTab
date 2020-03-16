import { Component } from "react"
import QuickLinks from '../../../public/data/quick-links.json'
import { LocalStorage } from '../../utils/storage'

export class DashboardQuickLinksComponent extends Component {
  render () {
    const locale = LocalStorage.get('locale')
    return (
      <div className="dashboard-quick-links">
        <h2 className="font-bold mb-3">Quick Links</h2>
        {
          QuickLinks.length
            ? (
              <ul>
                {QuickLinks.map(({ url, title, icon }) => {
                  const t = title[locale] ?? title['en']
                  return (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank" rel={t}
                        className="btn dashboard-quick-links-btn"
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
              </ul>
            )
            : (
              <div>
                No quick links
              </div>
            )
        }
      </div>
    )
  }
}
