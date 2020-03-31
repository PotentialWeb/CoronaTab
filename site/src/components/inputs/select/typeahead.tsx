import { PureComponent, createRef, RefObject } from 'react'
import Downshift from 'downshift'
import Tippy from '@tippyjs/react'
import { SelectProps } from '../select'
import CaretUpSvg from '../../../../public/icons/caret-up.svg'
import CaretDownSvg from '../../../../public/icons/caret-down.svg'
import CloseSvg from '../../../../public/icons/close.svg'

interface Props extends SelectProps {
  inputClassName?: string
  inputPlaceholder?: string
}

interface State {
  selectedItem: any
}

export class TypeaheadSelectInputComponent extends PureComponent<Props, State> {
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
      inputClassName,
      inputPlaceholder,
      listClassName,
      listItemClassName,
      listItemContentComponent,
      onChange,
      selectedItem: initialSelectedItem,
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
          <div className={`select typeahead-select ${className}`} {...props}>
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
                        .filter(({ name }) => name.toLowerCase().includes(inputValue?.toLowerCase()))
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
                                  ? listItemContentComponent
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
                <input
                  {...getInputProps()}
                  onClick={() => {
                    if (!isOpen) toggleMenu()
                    setState({ inputValue: '' })
                  }}
                  ref={this.inputRef}
                  placeholder={inputPlaceholder ?? 'Select...'}
                  className={`form-input ${inputClassName ?? ''}`}
                />
                <button
                  className="btn caret"
                  onClick={() => {
                    if (this.state.selectedItem) {
                      this.setState({ selectedItem: null })
                      setState({ selectedItem: null, inputValue: '' })
                    } else {
                      toggleMenu()
                      setState({ inputValue: '' })
                      this.inputRef.current.focus()
                    }
                  }}
                >
                  {(() => {
                    if (this.state.selectedItem) {
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
