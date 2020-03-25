import React from 'react'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  height?: string
  ratio?: string
  width?: string
}

export class SvgRectComponent extends React.Component<Props> {
  get ratio () {
    return this.props.ratio || '16:9'
  }

  get width () {
    return this.props.width || this.ratio.split(':')[0]
  }

  get height () {
    return this.props.height || this.ratio.split(':')[1]
  }

  render () {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${this.width} ${this.height}`} className={this.props.className}>
        <rect width={this.width} height={this.height} fill="none" />
      </svg>
    )
  }
}
