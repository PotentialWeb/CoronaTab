import { Component } from 'react'
import Downshift from 'downshift'

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

  render () {
    return (
      <Downshift
        initialSelectedItem={this.state.selectedPlace}
        onChange={this.onChange}
        itemToString={place => place?.name ?? ''}
      >
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          isOpen,
          inputValue,
          highlightedIndex,
          getRootProps
        }) => (
          <div className={`place-search ${this.props.className ?? ''}`}>
            <div
              {...getRootProps({} as any, { suppressRefError: true })}
            >
              <input
                {...getInputProps()}
                autoFocus
                placeholder="Search for a place..."
                className={`form-input ${this.props.inputClassName ?? ''}`}
              />
            </div>
            <ul
              {...getMenuProps()}
              className={`place-search-list ${this.props.listClassName ?? ''}`}
            >
              {
                isOpen
                  ? this.props.options
                    .map((place, index) => {
                      return (
                        <li
                          key={index}
                          {...getItemProps({
                            index,
                            item: place
                          })}
                          data-highlighted={highlightedIndex === index}
                          className={`place-search-list-item ${this.props.listItemClassName ?? ''}`}
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
