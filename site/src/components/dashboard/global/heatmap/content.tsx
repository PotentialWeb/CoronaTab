import { Component, RefObject, createRef } from 'react'
import { inject, observer } from 'mobx-react'
import { DashboardPageStore } from '../../../../pages/dashboard.store'

export interface Props {
  onClose?: () => any
  pageStore?: DashboardPageStore
}

export interface State {
}

@inject('pageStore')
@observer
export class DashboardGlobalHeatmapContentComponent extends Component<Props, State> {
  contentRef: RefObject<HTMLDivElement> = createRef()

  componentDidMount () {
    document.addEventListener('click', this.onDocumentClick)
  }

  onDocumentClick = (e: MouseEvent) => {
    const { current } = this.contentRef
    if (current && !current.contains(e.target as Node)) {
      this.props.onClose?.()
    }
  }

  render () {
    return (
      <div
        ref={this.contentRef}
        className="container m-auto"
        style={{ height: '90vh', maxWidth: '1280px' }}
      >
        <div
          className="h-full bg-white rounded md:mx-6 cursor-default depth-lg overflow-scroll scrolling-touch dashboard-spacer-x"
        >
          Map
        </div>
      </div>
    )
  }
}
