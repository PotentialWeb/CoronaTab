import { Component, createRef, RefObject } from 'react'
import Downshift from 'downshift'
import { Place as PlaceShape } from '@coronatab/shared'
import { Place, DashboardPageStore } from '../pages/dashboard.store'
import Tippy from '@tippyjs/react'
import CaretUpSvg from '../../public/icons/caret-up.svg'
import CaretDownSvg from '../../public/icons/caret-down.svg'
import CloseSvg from '../../public/icons/close.svg'

interface Props extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: Place[] | PlaceShape[]
  pageStore: DashboardPageStore
  selectedPlace?: Place | PlaceShape
  inputClassName?: string
  inputPlaceholder?: string
  listClassName?: string
  listItemClassName?: string
  onChange?: (selectedPlace: Place) => any
}

interface State {
  selectedPlace: Place | PlaceShape
}

export class PlaceSelectComponent extends Component<Props, State> {
  state: State = {
    selectedPlace: this.props.selectedPlace
  }

  inputRef: RefObject<HTMLInputElement> = createRef()

  componentDidUpdate (prevProps: Props) {
    if (prevProps.selectedPlace?.id !== this.props.selectedPlace?.id) {
      this.setState({ selectedPlace: this.props.selectedPlace })
    }
  }

  onChange = (selectedPlace: Place) => {
    this.setState({ selectedPlace })
    this.props.onChange?.(selectedPlace)
  }

  onStateChange = (changes: any, { setHighlightedIndex }) => {
    switch (changes.type) {
      case (Downshift.stateChangeTypes.changeInput):
        setHighlightedIndex(0)
        break
    }
  }

  render () {
    const {
      options,
      selectedPlace,
      className = '',
      inputClassName,
      inputPlaceholder,
      listClassName,
      listItemClassName,
      onChange,
      pageStore,
      ...props
    } = this.props

    const { localeStrings } = pageStore
    return (
      <Downshift
        initialSelectedItem={selectedPlace}
        selectedItem={this.state.selectedPlace}
        onChange={this.onChange}
        onStateChange={this.onStateChange}
        itemToString={place => place?.name ?? ''}
      >
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          toggleMenu,
          isOpen,
          inputValue,
          highlightedIndex,
          getRootProps,
          setState
        }) => (
          <div className={`place-select ${className}`} {...props}>
            <Tippy
              visible={isOpen}
              animation="shift-away"
              theme="light"
              className="place-select-list-tooltip"
              allowHTML={true}
              content={(
                <ul
                  {...getMenuProps({}, { suppressRefError: true })}
                  className={`place-select-list ${listClassName ?? ''}`}
                >
                  {
                    isOpen
                      ? options
                        .filter(({ name }) => name.toLowerCase().includes(inputValue?.toLowerCase()))
                        .map((place, index) => {
                          return (
                            <li
                              key={index}
                              {...getItemProps({
                                index,
                                item: place
                              })}
                              data-highlighted={highlightedIndex === index}
                              className={`place-select-list-item ${listItemClassName ?? ''}`}
                            >
                              <span className="font-bold">{place.name}</span>{' '}
                            </li>
                          )
                        })
                      : ''
                  }
                </ul>
              )}
              arrow={true}
              placement="bottom-start"
              duration={100}
              maxWidth="none"
              onHidden={() => setState({ isOpen: false })}
              interactive
            >
              <div
                {...getRootProps({} as any, { suppressRefError: true })}
                className="place-select-input-area"
              >
                <input
                  {...getInputProps()}
                  onClick={() => {
                    if (!isOpen) toggleMenu()
                    setState({ inputValue: '' })
                  }}
                  ref={this.inputRef}
                  placeholder={inputPlaceholder ?? `${localeStrings['select-a-place']}...`}
                  className={`form-input ${inputClassName ?? ''}`}
                />
                <button
                  className="btn caret"
                  onClick={() => {
                    if (this.state.selectedPlace) {
                      setState({ selectedItem: null })
                    } else {
                      toggleMenu()
                      setState({ inputValue: '' })
                      this.inputRef.current.focus()
                    }
                  }}
                >
                  {(() => {
                    if (this.state.selectedPlace) {
                      return <CloseSvg className="h-line-sm" />
                    }
                    return isOpen
                      ? (<CaretUpSvg className="h-line-sm" />)
                      : (<CaretDownSvg className="h-line-sm" />)
                  })()}
                </button>
              </div>
            </Tippy>
          </div>
        )}
      </Downshift>
    )
  }
}
