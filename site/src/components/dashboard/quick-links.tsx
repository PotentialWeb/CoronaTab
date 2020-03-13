import { Component } from "react"
import QuickLinks from '../../../public/data/quick-links.json'
import { LocalStorage } from '../../utils/storage'

export class DashboardQuickLinksComponent extends Component {
  render () {
    const locale = LocalStorage.get('locale')
    return (
      <div className="quick-links">
        <h2 className="font-bold">Quick Links</h2>
        {
          QuickLinks.length
            ? (
              <ul>
                {QuickLinks.map(({ url, title }) => {
                  const t = title[locale] ?? title['en']
                  return (
                    <li key={url}>
                      <a href={url} target="_blank" rel={t}>
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
