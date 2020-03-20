import { Component, RefObject, createRef } from 'react'

export interface Props {
  onClose?: () => any
}

export interface State {
}

export class DashboardGlobalStatsByCountryContentComponent extends Component<Props, State> {
  contentRef: RefObject<HTMLDivElement> = createRef()

  componentDidMount () {
    document.addEventListener('click', this.onDocumentClick)
  }

  onDocumentClick = (e: MouseEvent) => {
    if (!this.contentRef.current.contains(e.target as Node)) {
      this.props.onClose?.()
    }
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.onDocumentClick)
  }

  render () {
    return (
      <div
        ref={this.contentRef}
        className="container m-auto"
        style={{ maxWidth: '750px' }}
      >
        <div className="bg-white rounded md:mx-6 cursor-default depth-lg">
          Modal
        </div>
      </div>
    )
  }
}
