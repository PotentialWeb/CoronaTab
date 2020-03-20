import { Component } from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router'
import { ModalComponent } from '../../../modal'
import { Props as ContentProps } from './content'
import CloseSvg from '../../../../../public/icons/close.svg'
import { LoadingComponent } from '../../../loading'

const ContentComponent = dynamic<ContentProps>(() => (
  import('./content').then((_) => _.DashboardGlobalStatsByCountryContentComponent)
), {
  ssr: false,
  loading: () => <LoadingComponent className="h-8" />
})

interface Props {
  isVisible?: boolean
  onEntered?: () => any
  onExited?: () => any
}

interface State {
  isVisible: boolean
}

export class DashboardGlobalStatsByCountryModalComponent extends Component<Props, State> {
  state: State = {
    isVisible: false
  }

  componentDidMount () {
    Router.events.on('routeChangeStart', this.onRouteChangeStart)
  }

  componentDidUpdate (prevProps: Props) {
    if (prevProps.isVisible !== this.props.isVisible) {
      this.setState({ isVisible: this.props.isVisible })
    }
  }

  onRouteChangeStart = () => this.setState({ isVisible: false })

  onEntered = () => {
    this.props.onEntered?.()
    document.body.classList.add('overflow-hidden')
  }
  onExited = () => {
    this.props.onExited?.()
    document.body.classList.remove('overflow-hidden')
  }

  componentWillUnmount () {
    Router.events.off('routeChangeStart', this.onRouteChangeStart)
  }

  render () {
    if (typeof window === 'undefined') return ''

    const { isVisible } = this.state

    return (
      <ModalComponent
        in={isVisible}
        timeout={150}
        appear
        mountOnEnter={true}
        unmountOnExit={true}
        onEntered={this.onEntered}
        onExited={this.onExited}
        classNames="fade-y"
      >
        <div className="modal-centered cursor-pointer">
          <button
            onClick={() => this.setState({ isVisible: false })}
            className="btn modal-centered-close-btn"
          >
            <CloseSvg className="h-line-lg" />
          </button>
          <ContentComponent
            onClose={() => this.setState({ isVisible: false })}
          />
        </div>
      </ModalComponent>
    )
  }
}
