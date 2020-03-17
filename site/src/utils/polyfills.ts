import moment from 'moment'

declare global {
  interface DateConstructor {
    rangeToString (startDate: string | Date, endDate: string | Date): string
  }
}

Date.rangeToString = (startDate: string | Date, endDate: string | Date) => {
  if (!startDate || !endDate) return
  const checkInDate = moment(startDate)
  const checkOutDate = moment(endDate)
  const checkInYear = checkInDate.get('year')
  const checkOutYear = checkOutDate.get('year')
  const yearsMatch = checkInYear === checkOutYear
  return `${checkInDate.format(`D MMM${!yearsMatch ? ' YYYY' : ''}`)} - ${checkOutDate.format('D MMM YYYY')}`
}
