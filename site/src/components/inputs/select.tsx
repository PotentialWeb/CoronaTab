import { PureComponent, createRef, RefObject, ReactNode } from 'react'
import Downshift from 'downshift'
import Tippy from '@tippyjs/react'
import CaretUpSvg from '../../../public/icons/caret-up.svg'
import CaretDownSvg from '../../../public/icons/caret-down.svg'

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: any[]
  selectedItem?: any
  listClassName?: string
  listItemClassName?: string
  listItemContentComponent?: (item: any) => ReactNode
  itemToString?: (item: any) => string
  onChange?: (selectedItem: any) => any
}

interface Props extends SelectProps {
  buttonClassName?: string
  buttonContentComponent?: (selectedItem: any) => ReactNode
}

interface State {
  selectedItem: any
}

export class SelectInputComponent extends PureComponent<Props, State> {
  state: State = {
    selectedItem: this.props.selectedItem
  }

  inputRef: RefObject<HTMLInputElement> = createRef()

  onChange = (selectedItem: any) => {
    this.setState({ selectedItem })
    this.props.onChange?.(selectedItem)
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
      className = '',
      itemToString = (item: any) => item,
      listClassName,
      listItemClassName,
      listItemContentComponent,
      buttonClassName,
      buttonContentComponent,
      selectedItem: initialSelectedItem,
      onChange,
      ...props
    } = this.props

    const {
      selectedItem
    } = this.state

    return (
      <Downshift
        selectedItem={selectedItem}
        onChange={this.onChange}
        onStateChange={this.onStateChange}
        itemToString={itemToString}
      >
        {({
          getItemProps,
          getMenuProps,
          isOpen,
          inputValue,
          highlightedIndex,
          getRootProps,
          setState
        }) => (
          <div className={`select ${className}`} {...props}>
            <Tippy
              visible={isOpen}
              animation="shift-away"
              theme="light"
              className="select-list-tooltip"
              allowHTML={true}
              content={(
                <ul
                  {...getMenuProps({}, { suppressRefError: true })}
                  className={`select-list ${listClassName ?? ''}`}
                >
                  {
                    isOpen
                      ? options
                        .map((item, index) => {
                          return (
                            <li
                              key={index}
                              {...getItemProps({
                                index,
                                item
                              })}
                              data-highlighted={highlightedIndex === index}
                              className={`select-list-item ${listItemClassName ?? ''}`}
                            >
                              {
                                listItemContentComponent
                                  ? listItemContentComponent(item)
                                  : (<span className="font-bold">{itemToString(item)}</span>)
                              }
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
                className="select-input-area"
              >
                <button
                  className={buttonClassName ?? ''}
                  onClick={() => setState({ isOpen: true })}
                >
                  {
                    buttonContentComponent
                      ? buttonContentComponent(selectedItem)
                      : (<span className="mr-2">{itemToString(selectedItem)}</span>)
                  }
                  {
                    isOpen
                      ? (<CaretUpSvg className="h-line-sm" />)
                      : (<CaretDownSvg className="h-line-sm" />)
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
