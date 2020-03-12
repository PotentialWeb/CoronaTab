import { useStaticRendering } from 'mobx-react'

useStaticRendering(typeof window === 'undefined')

export class AppStore {
}
