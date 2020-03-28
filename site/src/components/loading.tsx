import React from 'react'
import LogoSvg from '../../public/icons/logo.svg'

export const LoadingComponent = ({ className, ...props }) => (
  <LogoSvg
    className={`animation-pulse ${className}`}
    {...props}
  />
)
