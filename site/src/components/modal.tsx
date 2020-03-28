// import React from 'react'
import ReactDOM from 'react-dom'
import { CSSTransition } from 'react-transition-group'

// NOTE: Should you extend ModalComponent, you can extend
// props like this:
//
// import { TransitionProps } from 'react-transition-group/Transition'
// interface Props extends TransitionProps {
// }

export class ModalComponent extends CSSTransition {
  render () {
    return ReactDOM.createPortal(
      super.render(),
      document.body
    )
  }
}
