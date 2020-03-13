import { Component } from 'react'
import Downshift from 'downshift'
import { Place } from '../../../shared/places'

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

  onChange = (selectedPlace: Place) => {
    this.setState({ selectedPlace })
    this.props.onChange?.(selectedPlace)
  }

  onInputValueChange = (value: string, { selectedItem, clearSelection, highlightedIndex, setHighlightedIndex }) => {
    if (!selectedItem && !highlightedIndex) setHighlightedIndex(0)
  }

  render () {
    return (
      <Downshift
        initialSelectedItem={this.state.selectedPlace}
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
          <div className={`place-select ${this.props.className ?? ''}`}>
            <div
              {...getRootProps({} as any, { suppressRefError: true })}
            >
              <input
                {...getInputProps()}
                onClick={() => {
                  if (!isOpen) toggleMenu()
                  setState({ inputValue: '' })
                }}
                placeholder="Search for a place..."
                className={`form-input ${this.props.inputClassName ?? ''}`}
              />
              <button onClick={() => toggleMenu()}>
                {isOpen ? '^' : 'v'}
              </button>
            </div>
            <ul
              {...getMenuProps()}
              className={`place-select-list ${this.props.listClassName ?? ''}`}
            >
              {
                isOpen
                  ? this.props.options
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
                          className={`place-select-list-item ${this.props.listItemClassName ?? ''}`}
                        >
                          <span className="font-bold">{place.name}</span>{' '}
                        </li>
                      )
                    })
                  : ''
              }
            </ul>
          </div>
        )}
      </Downshift>
    )
  }
}
