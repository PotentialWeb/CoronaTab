import { Component, HTMLAttributes } from 'react'
import Tippy from '@tippyjs/react'
import { DayPickerComponent } from './day-picker'
import CalendarSvg from '../../public/icons/calendar.svg'

type DateSelectValue = { startDate?: Date, endDate?: Date }

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  onChange: ({ startDate, endDate }: DateSelectValue) => any
  startDate: Date
  endDate: Date
  minDate: Date
  maxDate: Date
  month: Date
  fromMonth: Date
  toMonth: Date
  buttonProps?: HTMLAttributes<HTMLButtonElement>
}

interface State {
  isOpen: boolean
  startDate?: Date
  endDate?: Date
}

export class DateSelectComponent extends Component<Props,State> {
  state: State = {
    isOpen: false,
    startDate: this.props.startDate,
    endDate: this.props.endDate
  }

  toggleIsOpen = () => this.setState(prevState => ({ isOpen: !prevState.isOpen }))

  onChange = (dates: DateSelectValue) => {
    this.setState({ ...dates })
    this.props.onChange(dates)
    this.setState({ isOpen: false })
  }

  render () {
    const { isOpen, startDate, endDate } = this.state
    const hasDates = startDate && endDate
    const {
      startDate: initialStartDate,
      endDate: initialEndDate,
      onChange,
      minDate,
      maxDate,
      month,
      fromMonth,
      toMonth,
      buttonProps,
      className = '',
      ...props
    } = this.props

    return (
      <div className={`date-select ${className}`} {...props}>
        <Tippy
          visible={isOpen}
          zIndex={39}
          animation="shift-away"
          theme="light"
          allowHTML={true}
          appendTo={document.body}
          content={
            isOpen
            ? (
              <div className="trip-date-select-tooltip p-2">
                <DayPickerComponent
                  startDate={startDate}
                  endDate={endDate}
                  minDate={minDate}
                  maxDate={maxDate}
                  month={month}
                  fromMonth={fromMonth}
                  toMonth={toMonth}
                  onApply={this.onChange}
                  onCancel={() => this.setState({ isOpen: false })}
                />
              </div>
            )
            : ''
          }
          arrow={true}
          placement="bottom-start"
          duration={100}
          interactive
          onHidden={() => this.setState({ isOpen: false })}
          maxWidth="none"
        >
          <button
            onClick={() => this.setState({ isOpen: true })}
            className="btn trip-date-select-btn"
            {...buttonProps}
          >
            <CalendarSvg className="h-line mr-2" />
            <span>
              {
                hasDates
                  ? Date.rangeToString(startDate, endDate)
                  : 'Select dates'
              }
            </span>
          </button>
        </Tippy>
      </div>
    )
  }
}
