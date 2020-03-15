import { Component } from 'react'
import Downshift from 'downshift'
import { Place } from '../../../shared/places'
import Tippy from '@tippy.js/react'
import CaretUpSvg from '../../public/icons/caret-up.svg'
import CaretDownSvg from '../../public/icons/caret-down.svg'

interface Props extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: Place[]
  initialValue?: Place
  inputClassName?: string
  listClassName?: string
  listItemClassName?: string
  onChange?: (selectedPlace: Place) => any
}

interface State {
  selectedPlace: Place
}

export class PlaceSelectComponent extends Component<Props, State> {
  state: State = {
    selectedPlace: this.props.initialValue
  }

  componentDidUpdate (prevProps: Props) {
    if (prevProps.initialValue?.id !== this.props.initialValue?.id) {
      this.setState({ selectedPlace: this.props.initialValue })
    }
  }

  onChange = (selectedPlace: Place) => {
    this.setState({ selectedPlace })
    this.props.onChange?.(selectedPlace)
  }

  onInputValueChange = (value: string, { highlightedIndex, setHighlightedIndex }) => {
    console.log(value, highlightedIndex)
    setHighlightedIndex(0)
  }

  render () {
    const {
      options,
      initialValue,
      className,
      inputClassName,
      listClassName,
      listItemClassName,
      onChange,
      ...props
    } = this.props

    return (
      <Downshift
        initialSelectedItem={this.state.selectedPlace}
        selectedItem={this.state.selectedPlace}
        onChange={this.onChange}
        onInputValueChange={this.onInputValueChange}
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
          <div className={`place-select ${className ?? ''}`} {...props}>
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
              trigger="manual"
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
                  placeholder="Search for a place..."
                  className={`form-input ${inputClassName ?? ''}`}
                />
                <button className="btn caret" onClick={() => toggleMenu()}>
                  {isOpen
                    ? <CaretUpSvg className="h-line-sm" />
                    : <CaretDownSvg className="h-line-sm" />
                  }
                </button>
              </div>
            </Tippy>
          </div>
        )}
      </Downshift>
    )
  }
}
