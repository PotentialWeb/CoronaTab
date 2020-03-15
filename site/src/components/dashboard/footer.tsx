import { Component } from 'react'
import { ShareBtnComponent } from '../share-btn'

export class DashboardFooterComponent extends Component {
  render () {
    return (
      <footer className="px-6 pb-6 pt-4">
        <div className="flex items-center min-w-0 -mx-2">
          <div className="flex-1 min-w-0 px-2">
            <ShareBtnComponent
              className="btn btn-white flex items-center border border-light px-6 py-1 rounded"
            />
          </div>
          <div className="flex-shrink-0 px-2">
            <span className="text-xs">
              Made with ♥ by the team at{' '}
              <a href="https://hoobu.com" target="_blank" className="font-bold underline">
                Hoobu
              </a>
            </span>
            <div>
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
                className="inline-block"
              />
            </div>
          </div>
        </div>
      </footer>
    )
  }
}
