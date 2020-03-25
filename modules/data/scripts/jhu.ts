import { File } from '@coronatab/node-utils'
import CSV from 'csvtojson'
import moment from 'moment'
import { DATE_FORMAT } from '@coronatab/shared'
import { SeededCountries } from '../src/seeds/places/countries/seeds'
import { SeededRegions } from '../src'

export class JHU {

  static async getOldTimeseriesData () {
    const CASES_CSV_URL = 'https://github.com/CSSEGISandData/COVID-19/raw/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv'
    const DEATHS_CSV_URL = 'https://github.com/CSSEGISandData/COVID-19/raw/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv'
    const RECOVERED_CSV_URL = 'https://github.com/CSSEGISandData/COVID-19/raw/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv'

    const [
    casesStream,
    recoveredStream,
    deathsStream
    ] = await Promise.all([
      File.download({
        url: CASES_CSV_URL,
        return: 'Stream'
      }),
      File.download({
        url: RECOVERED_CSV_URL,
        return: 'Stream'
      }),
      File.download({
        url: DEATHS_CSV_URL,
        return: 'Stream'
      })
    ])

    const RAW_ROW_META_COLUMNS = [
      'Province/State',
      'Country/Region',
      'Lat',
      'Long'
    ] as const
    type RawRowMetaColumn = typeof RAW_ROW_META_COLUMNS[number]
    type RawDataRow = { [meta in RawRowMetaColumn]: string } & { [date: string]: string }

    type NormalizedDataRowDates = {
      [date: string]: {
        cases: number
        deaths: number
        recovered: number
      }
    }
    type NormalizedDataRow = {
      countryId: string
      region: string
      lat: number
      lng: number
      dates: NormalizedDataRowDates
    }
    const [
      casesRawRows,
      recoveredRawRows,
      deathsRawRows
    ]: RawDataRow[][] = await Promise.all([
      CSV().fromStream(casesStream as any),
      CSV().fromStream(recoveredStream as any),
      CSV().fromStream(deathsStream as any)
    ])

    const data: NormalizedDataRow[] = []
    casesRawRows
    .filter(r => !['Princess', 'Cruise Ship'].some(ignore => r['Country/Region'].includes(ignore) || r['Province/State'].includes(ignore)))
    .forEach(casesRow => {
      const countryName = casesRow['Country/Region']
      const country = SeededCountries.find(c => c.alpha2code === this.COUNTRY_CODE_MAP[countryName])
      if (!country) {
        console.error(`Country not found: ${countryName} ${this.COUNTRY_CODE_MAP[casesRow.country]}`)
        return
      }
      let region = casesRow['Province/State']

      const deathsRow = deathsRawRows.find(r => r['Country/Region'] === countryName && r['Province/State'] === region)
      const recoveredRow = recoveredRawRows.find(r => r['Country/Region'] === countryName && r['Province/State'] === region)

      if (region === countryName || region === '') {
        region = undefined
      }
      data.push({
        countryId: country.id,
        region,
        lat: parseFloat(casesRow.Lat),
        lng: parseFloat(casesRow.Long),
        dates: Object.entries(casesRow)
              .filter(([key, cases]) => !RAW_ROW_META_COLUMNS.includes(key as RawRowMetaColumn) && parseInt(cases) > 0)
              .reduce((dates, [ date, casesString ]) => {

                const [ _, deathsString ] = Object.entries(deathsRow).find(([ deathsDate ]) => deathsDate === date)
                const [ __, recoveredString ] = Object.entries(recoveredRow).find(([ recoveredDate ]) => recoveredDate === date)
                const cases = parseInt(casesString) || 0
                const deaths = parseInt(deathsString) || 0
                const recovered = parseInt(recoveredString) || 0
                dates[moment(new Date(date)).format(DATE_FORMAT)] = {
                  recovered,
                  cases,
                  deaths
                }
                return dates
              }, {} as NormalizedDataRowDates)
      })
    })

    return data
  }

  static async getLatestData () {
    const DOWNLOAD_URL = 'https://github.com/CSSEGISandData/COVID-19/raw/web-data/data/cases.csv'

    const downloadStream = await File.download({
      url: DOWNLOAD_URL,
      return: 'Stream'
    })

    interface RawDataRow {
      FIPS?: string
      Admin2?: string
      Province_State?: string
      Country_Region: string
      Last_Update: string
      Lat: string
      Long_: string
      Confirmed: string
      Deaths: string
      Recovered: string
      Active: string
      Combined_Key: string
    }

    type NormalizedDataRow = {
      countryId: string
      region?: string
      city?: string
      lat: number
      lng: number
      cases: number
      deaths: number
      recovered: number
    }

    const rawRows: RawDataRow[] = await CSV().fromStream(downloadStream as any)

    const data: NormalizedDataRow[] = rawRows
      .filter(r => !['Princess', 'Cruise Ship'].some(ignore => r['Country/Region'].includes(ignore) || r['Province/State'].includes(ignore)))
      .map(row => {
        const countryName = row.Country_Region
        const region = row.Province_State
        let city = row.Admin2
        if (city === 'Unassigned') {
          city = null
        }
        const country = SeededCountries.find(c => c.alpha2code === this.COUNTRY_CODE_MAP[countryName])
        if (!country) throw new Error(`Country not found in DB: ${countryName} ${this.COUNTRY_CODE_MAP[countryName]}`)

        const cases = parseInt(row.Confirmed) || 0
        const deaths = parseInt(row.Deaths) || 0
        let recovered = parseInt(row.Recovered) || 0
        let active = parseInt(row.Active) ?? 0
        if (!recovered && active) {
          recovered = cases - active
        }
        return {
          countryId: country.id,
          region,
          city,
          lat: parseFloat(row.Lat),
          lng: parseFloat(row.Long_),
          cases,
          deaths,
          recovered
        }
      })

    return data
  }

  static getPlaceFromEntry ({
    countryId,
    region
  }: {
    countryId: string
    region?: string
  }) {
    const country = SeededCountries.find(c => c.id === countryId)

    if (!region || region === country.locales.en) {
      return country
    }

    if (countryId === 'united-states-of-america') {
      const match = /(.*), ([A-Z]{2})$/g.exec(region)
      if (!match) {
        // State
        const state = SeededRegions.find(r => r.parentId === country.id && r.locales.en === region)
        return state
      } else {
        // City or County
        const [_, placeName, stateCode ] = match
        const state = SeededRegions.find(r => r.parentId === country.id && r.alpha2code === stateCode)
        const region = SeededRegions.find(r => r.parentId === state.id && r.locales.en === placeName)
        return region
      }
    } else {
      const place = SeededRegions.find(r => r.parentId === country.id && r.locales.en === region)
      return place
    }

  }

  static COUNTRY_CODE_MAP = {
    'Afghanistan': 'AF',
    'Albania': 'AL',
    'Algeria': 'DZ',
    'American Samoa': 'AS',
    'Andorra': 'AD',
    'Angola': 'AO',
    'Anguilla': 'AI',
    'Antigua and Barbuda': 'AG',
    'Argentina': 'AR',
    'Armenia': 'AM',
    'Aruba': 'AW',
    'Australia': 'AU',
    'Austria': 'AT',
    'Azerbaijan': 'AZ',
    'Bahamas': 'BS',
    'The Bahamas': 'BS',
    'Bahamas, The': 'BS',
    'Bahrain': 'BH',
    'Bangladesh': 'BD',
    'Barbados': 'BB',
    'Belarus': 'BY',
    'Belgium': 'BE',
    'Belize': 'BZ',
    'Benin': 'BJ',
    'Bermuda': 'BM',
    'Bhutan': 'BT',
    'Bolivia': 'BO',
    'Bonaire, Sint Eustatius and Saba': 'BQ',
    'Bosnia and Herzegovina': 'BA',
    'Botswana': 'BW',
    'Brazil': 'BR',
    'British Indian Ocean Territory': 'IO',
    'British Virgin Islands': 'VG',
    'Brunei Darussalam': 'BN',
    'Brunei': 'BN',
    'Bulgaria': 'BG',
    'Burkina Faso': 'BF',
    'Burundi': 'BI',
    'Cabo Verde': 'CV',
    'Cape Verde': 'CV',
    'Cambodia': 'KH',
    'Cameroon': 'CM',
    'Canada': 'CA',
    'Cayman Islands': 'KY',
    'Central African Republic': 'CF',
    'Chad': 'ID',
    'Chile': 'CL',
    'China': 'CN',
    'Colombia': 'CO',
    'Comoros': 'KM',
    'Congo (Kinshasa)': 'CD',
    'Cook Islands': 'CK',
    'Costa Rica': 'CR',
    "Cote d'Ivoire": 'CI',
    'Croatia': 'HR',
    'Cuba': 'CU',
    'Curacao': 'CW',
    'Cyprus': 'CY',
    'Czechia': 'CZ',
    'Cote dIvoire': 'CI',
    'Democratic Republic of the Congo': 'CD',
    'Denmark': 'DK',
    'Djibouti': 'DJ',
    'Dominica': 'DM',
    'Dominican Republic': 'DO',
    'Ecuador': 'EC',
    'Egypt': 'EG',
    'El Salvador': 'SV',
    'Equatorial Guinea': 'GQ',
    'Eritrea': 'ER',
    'Estonia': 'EE',
    'Eswatini': 'SZ',
    'Ethiopia': 'ET',
    'Falkland Islands': 'FK',
    'Faroe Islands': 'FO',
    'Federated States of Micronesia': 'FM',
    'Fiji': 'FJ',
    'Finland': 'FI',
    'France': 'FR',
    'French Guiana': 'GF',
    'French Polynesia': 'PF',
    'Gabon': 'GA',
    'Gambia': 'GM',
    'The Gambia': 'GM',
    'Gambia, The': 'GM',
    'Georgia': 'GE',
    'Germany': 'DE',
    'Ghana': 'GH',
    'Gibraltar': 'GI',
    'Greece': 'GR',
    'Greenland': 'GL',
    'Grenada': 'GD',
    'Guadeloupe': 'GP',
    'Guam': 'GU',
    'Guatemala': 'GT',
    'Guernsey': 'GG',
    'Guinea': 'GN',
    'Guinea-Bissau': 'GW',
    'Guyana': 'GY',
    'Haiti': 'HT',
    'Holy See': 'VA',
    'Honduras': 'HN',
    'Hong Kong': 'HK',
    'Hungary': 'HU',
    'Iceland': 'IS',
    'India': 'IN',
    'Indonesia': 'ID',
    'Iran': 'IR',
    'Iraq': 'IQ',
    'Ireland': 'IE',
    'Israel': 'IL',
    'Italy': 'IT',
    'Jamaica': 'JM',
    'Japan': 'JP',
    'Jersey': 'JE',
    'Jordan': 'JO',
    'Kazakhstan': 'KZ',
    'Kenya': 'KE',
    'Kiribati': 'KI',
    'Korea, North': 'KP',
    'Korea, South': 'KR',
    'Kosovo': 'XK',
    'Kuwait': 'KW',
    'Kyrgyzstan': 'KG',
    'Laos': 'LA',
    'Latvia': 'LV',
    'Lebanon': 'LB',
    'Lesotho': 'LS',
    'Liberia': 'LR',
    'Libya': 'LY',
    'Liechtenstein': 'LI',
    'Lithuania': 'LT',
    'Luxembourg': 'LU',
    'Macao': 'MO',
    'Macedonia': 'MK',
    'Madagascar': 'MG',
    'Malawi': 'MW',
    'Malaysia': 'MY',
    'Maldives': 'MV',
    'Mali': 'ML',
    'Malta': 'MT',
    'Marshall Islands': 'MH',
    'Martinique': 'MQ',
    'Mauritania': 'MR',
    'Mauritius': 'MU',
    'Mayotte': 'YT',
    'Mexico': 'MX',
    'Moldova': 'MD',
    'Monaco': 'MC',
    'Mongolia': 'MN',
    'Montenegro': 'ME',
    'Montserrat': 'MS',
    'Morocco': 'MA',
    'Mozambique': 'MZ',
    'Myanmar': 'MM',
    'Namibia': 'NA',
    'Nauru': 'NR',
    'Nepal': 'NP',
    'Netherlands Antilles': 'AN',
    'Netherlands': 'NL',
    'New Caledonia': 'NC',
    'New Zealand': 'NZ',
    'Nicaragua': 'NI',
    'Niger': 'NE',
    'Nigeria': 'NG',
    'Niue': 'NU',
    'Norfolk Island': 'NF',
    'North Korea': 'KP',
    'North Macedonia': 'MK',
    'Northern Mariana Islands': 'MP',
    'Norway': 'NO',
    'Oman': 'OM',
    'Pakistan': 'PK',
    'Palau': 'PW',
    'Palestine': 'PS',
    'occupied Palestinian territory': 'PS',
    'Panama': 'PS',
    'Papua New Guinea': 'PG',
    'Paraguay': 'PY',
    'Peru': 'PE',
    'Philippines': 'PH',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Puerto Rico': 'PR',
    'Qatar': 'QA',
    'Republic of Congo': 'CG',
    'Republic of the Congo': 'CG',
    'Congo (Brazzaville)': 'CG',
    'Reunion': 'RE',
    'Romania': 'RO',
    'Russia': 'RU',
    'Rwanda': 'RW',
    'Saint Barthelemy': 'BL',
    'Saint Helena': 'SH',
    'Saint Kitts and Nevis': 'KN',
    'Saint Lucia': 'LC',
    'Saint Martin': 'MF',
    'Saint Pierre and Miquelon': 'PM',
    'Saint Vincent and the Grenadines': 'VC',
    'Samoa': 'WS',
    'San Marino': 'SM',
    'Saudi Arabia': 'SA',
    'Senegal': 'SN',
    'Serbia': 'RS',
    'Seychelles': 'SC',
    'Sierra Leone': 'SL',
    'Singapore': 'SG',
    'Sint Maarten (Dutch part)': 'SX',
    'Slovakia': 'SK',
    'Slovenia': 'SI',
    'Solomon Islands': 'SB',
    'Somalia': 'SO',
    'South Africa': 'ZA',
    'South Korea': 'KR',
    'South Sudan': 'SS',
    'Spain': 'ES',
    'Sri Lanka': 'LK',
    'St. Martin': 'MF',
    'Sudan': 'SD',
    'Suriname': 'SR',
    'Swaziland': 'SZ',
    'Sweden': 'SE',
    'Switzerland': 'CH',
    'Syrian Arab Republic': 'SY',
    'Syria': 'SY',
    'Sao Tome and Principe': 'ST',
    'Taiwan*': 'TW',
    'Taiwan': 'TW',
    'Tajikistan': 'TJ',
    'Tanzania': 'TZ',
    'Thailand': 'TH',
    'Timor-Leste': 'TL',
    'East Timor': 'TL',
    'Togo': 'TG',
    'Tokelau': 'TK',
    'Tonga': 'TO',
    'Trinidad and Tobago': 'TT',
    'Tunisia': 'TN',
    'Turkey': 'TR',
    'Turkmenistan': 'TM',
    'Turks and Caicos Islands': 'TC',
    'Tuvalu': 'TV',
    'US Virgin Islands': 'VI',
    'Uganda': 'UG',
    'Ukraine': 'UA',
    'United Arab Emirates': 'AE',
    'UK': 'GB',
    'United Kingdom': 'GB',
    'US': 'US',
    'United States': 'US',
    'Uruguay': 'UY',
    'Uzbekistan': 'UZ',
    'Vanuatu': 'VU',
    'Vatican City': 'VA',
    'Venezuela': 'VE',
    'Vietnam': 'VN',
    'Wallis and Futuna': 'WF',
    'Yemen': 'YE',
    'Zambia': 'ZM',
    'Zimbabwe': 'ZW'
  }

}
