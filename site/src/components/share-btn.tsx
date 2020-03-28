import { Component, HTMLAttributes } from 'react'
import Tippy, { TippyProps } from '@tippyjs/react'
import { Meta } from '../utils/meta'
import {
  EmailShareButton,
  FacebookShareButton,
  FacebookMessengerShareButton,
  LinkedinShareButton,
  RedditShareButton,
  TwitterShareButton,
  WhatsappShareButton
} from 'react-share'
import EmailSvg from '../../public/icons/email.svg'
import FacebookSvg from '../../public/icons/facebook.svg'
import LinkedinSvg from '../../public/icons/linkedin.svg'
import MessengerSvg from '../../public/icons/messenger.svg'
import RedditSvg from '../../public/icons/reddit.svg'
import ShareSvg from '../../public/icons/share.svg'
import TwitterSvg from '../../public/icons/twitter.svg'
import WhatsappSvg from '../../public/icons/whatsapp.svg'

interface Props extends HTMLAttributes<HTMLButtonElement> {
  tooltipPlacement?: 'top' | 'bottom'
}

export class ShareBtnComponent extends Component<Props> {
  render () {
    const {
      tooltipPlacement,
      className = '',
      ...props
    } = this.props

    const shareUrl = `${Meta.BASE_PATH}/dashboard`
    const title = `${Meta.APP_NAME} - ${Meta.STRAPLINE}`
    const buttonClassName = ''
    const tippyProps: Partial<TippyProps> = {
      animation: 'shift-away',
      theme: 'light',
      allowHTML: true,
      arrow: true,
      duration: 100,
      interactive: true,
      trigger: 'click',
      placement: tooltipPlacement ?? 'top'
    }

    if (typeof window !== 'undefined') tippyProps.appendTo = document.body

    return (
      <Tippy
        className="share-btn-tooltip"
        content={(
          <ul>
            <li>
              <EmailShareButton
                url={shareUrl}
                subject={`Check out ${Meta.APP_NAME}`}
                body={Meta.STRAPLINE}
                className={buttonClassName}
              >
                <EmailSvg className="h-line" />
              </EmailShareButton>
            </li>
            <li>
              <TwitterShareButton
                url={shareUrl}
                title={title}
                className={buttonClassName}
              >
                <TwitterSvg className="h-line" />
              </TwitterShareButton>
            </li>
            <li>
              <FacebookShareButton
                url={shareUrl}
                quote={title}
                className={buttonClassName}
              >
                <FacebookSvg className="h-line" />
              </FacebookShareButton>
            </li>
            <li>
              <FacebookMessengerShareButton
                url={shareUrl}
                appId={Meta.FACEBOOK_APP_ID}
                className={buttonClassName}
              >
                <MessengerSvg className="h-line" />
              </FacebookMessengerShareButton>
            </li>
            <li>
              <LinkedinShareButton
                url={shareUrl}
                className={buttonClassName}
              >
                <LinkedinSvg className="h-line" />
              </LinkedinShareButton>
            </li>
            <li>
              <RedditShareButton
                url={shareUrl}
                title={title}
                windowWidth={660}
                windowHeight={460}
                className={buttonClassName}
              >
                <RedditSvg className="h-line" />
              </RedditShareButton>
            </li>
            <li>
              <WhatsappShareButton
                url={shareUrl}
                title={title}
                separator=":: "
                className={buttonClassName}
              >
                <WhatsappSvg className="h-line" />
              </WhatsappShareButton>
            </li>
          </ul>
        )}
        {...tippyProps}
      >
        <button className={`share-btn ${className}`} {...props}>
          <ShareSvg className="h-line mr-2" />
          <span>Share</span>
        </button>
      </Tippy>
    )
  }
}
