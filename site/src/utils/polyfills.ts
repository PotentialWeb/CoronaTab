import moment from 'moment'

declare global {
  interface DateConstructor {
    rangeToString (start: string | Date, end: string | Date): string
  }
}

Date.rangeToString = (start: string | Date, end: string | Date) => {
  if (!start || !end) return
  const startDate = moment(start)
  const endDate = moment(end)
  if (startDate.toISOString() === endDate.toISOString()) return endDate.format(`D MMM YYYY`)
  const startYear = startDate.get('year')
  const endYear = endDate.get('year')
  const yearsMatch = startYear === endYear
  return `${startDate.format(`D MMM${!yearsMatch ? ' YYYY' : ''}`)} - ${endDate.format('D MMM YYYY')}`
}
