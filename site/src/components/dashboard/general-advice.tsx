import { Component } from 'react'
import SwiperComponent from 'react-id-swiper'
import Swiper from 'swiper'
import { inject, observer } from 'mobx-react'
import { DashboardPageStore } from '../../pages/dashboard.store'

interface Props {
  pageStore?: DashboardPageStore,
}

export enum GeneralAdviceId {
  WASH_HANDS = 'wash-hands',
  MINIMISE_CONTACT = 'minimise-contact',
  AVOID_FACE = 'avoid-face',
  BE_HYGIENIC = 'be-hygienic',
  SELF_ISOLATE = 'self-isolate'
}

interface State {
  swiper: Swiper
}

@inject('pageStore')
@observer
export class DashboardGeneralAdviceComponent extends Component<Props, State> {
  state: State = {
    swiper: null
  }

  onSwiperInit = (swiper: Swiper) => {
    this.setState({ swiper })
  }

  onSwiperControlClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, action: 'prev' | 'next') => {
    e.preventDefault()
    e.stopPropagation()
    switch (action) {
      case 'prev':
        this.state.swiper?.slidePrev?.()
        break
      case 'next':
        this.state.swiper?.slideNext?.()
        break
    }
  }

  render () {
    const { pageStore } = this.props

    if (!pageStore.advice) return ''

    const swiperParams = {
      loop: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
      }
    }

    return (
      <div className="general-advice">
        <h2 className="font-bold">General Advice</h2>
        <div>
          <SwiperComponent
            getSwiper={this.onSwiperInit}
            {...swiperParams}
          >
            {
              Object.values(GeneralAdviceId)
                .map(key => {
                  const { title, description } = pageStore.advice[key]
                  if (!title || !description) return
                  return (
                    <div key={key}>
                      <span>Image</span>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  )
                })
            }
          </SwiperComponent>
        </div>
      </div>
    )
  }
}
