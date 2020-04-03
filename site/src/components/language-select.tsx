import { PureComponent } from 'react'
import Router from 'next/router'
import { Languages, LocaleId } from '@coronatab/shared'
import { SelectInputComponent } from './inputs/select'
import { inject, observer } from 'mobx-react'
import { AppStore } from '../pages/_app.store'

interface Props {
  appStore?: AppStore
}

interface State {
  selectedPlaceId: LocaleId
}

const languages = Object.entries(Languages).map(([locale, name]) => ({
  locale, name
}))

@inject('appStore')
@observer
export class LanguageSelectComponent extends PureComponent<Props, State> {
  state: State = {
    selectedPlaceId: this.props.appStore.locale
  }

  changeLanguage = async (locale: LocaleId) => {
    try {
      // window.localStorage.clear()
      await this.props.appStore.i18n.changeLanguage(locale)
      window.localStorage.setItem('locale', locale)
      console.info('Changed language')
      setTimeout(() => {
        const url = new URL(document.location.href)
        url.pathname = url.pathname.replace(/\/.*\/(.*)/g, `/${locale}/$1`)
        document.location.href = url.toString()
      }, 100)
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const { appStore } = this.props
    const { locale } = appStore
    const selectedLanguage = languages.find(lang => lang.locale === locale)

    return (
      <SelectInputComponent
        selectedItem={selectedLanguage}
        options={languages}
        itemToString={(language) => language?.name ?? ''}
        onChange={({ locale }) => this.changeLanguage(locale)}
        buttonClassName="btn btn-white flex items-center border border-light text-sm rounded-sm px-2 py-1 font-bold"
      />
    )
  }
}
