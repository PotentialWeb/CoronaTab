import React from 'react'
import Tippy from '@tippy.js/react'
import { DayPickerComponent } from './day-picker'
import CalendarSvg from '../../public/icons/calendar.svg'

type DateSelectValue = { startDate?: Date, endDate?: Date }

interface Props extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  onChange: ({ startDate, endDate }: DateSelectValue) => any
  startDate: Date
  endDate: Date
  minDate: Date
  maxDate: Date
  month: Date
  fromMonth: Date
  toMonth: Date
}

interface State {
  isOpen: boolean
  startDate?: Date
  endDate?: Date
}

export class DateSelectComponent extends React.Component<Props,State> {
  state: State = {
    isOpen: false,
    startDate: this.props.startDate,
    endDate: this.props.endDate
  }

  toggleIsOpen = () => this.setState(prevState => ({ isOpen: !prevState.isOpen }))

  onChange = (dates: DateSelectValue) => {
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
      ...props
    } = this.props

    return (
      <div className="date-select" {...props}>
        <Tippy
          visible={isOpen}
          zIndex={39}
          animation="shift-away"
          theme="light"
          allowHTML={true}
          boundary="window"
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
          trigger="manual"
          interactive
          onHidden={() => this.setState({ isOpen: false })}
          maxWidth="none"
        >
          <button
            onClick={() => this.setState({ isOpen: true })}
            className="btn trip-date-select-btn"
          >
            <CalendarSvg className="h-line" />
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
