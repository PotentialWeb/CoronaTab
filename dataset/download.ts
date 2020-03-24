import { File } from '@coronatab/node-utils'
import CSV from 'csvtojson'
import { Place, PlaceData, connect } from '@coronatab/data'
import dasherize from 'dasherize'
import moment from 'moment'

import { config as injectEnvs } from 'dotenv'
import { DATE_FORMAT } from '@coronatab/shared'

injectEnvs()

const COUNTRY_CODE_MAP = {
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

const CASES_CSV_URL = 'https://github.com/CSSEGISandData/COVID-19/raw/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv'
const DEATHS_CSV_URL = 'https://github.com/CSSEGISandData/COVID-19/raw/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv'
const RECOVERED_CSV_URL = 'https://github.com/CSSEGISandData/COVID-19/raw/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv'

const RAW_ROW_META_COLUMNS = [
  'Province/State',
  'Country/Region',
  'Lat',
  'Long'
] as const
type RawRowMetaColumn = typeof RAW_ROW_META_COLUMNS[number]

type RawDataRow = { [meta in RawRowMetaColumn]: string } & { [date: string]: string }
type NormalizedDataRow = {
  country: string
  region: string
  lat: number
  lng: number
  data: { [date: string]: number }
}

;(async () => {
  await connect()

  console.log('Downloading dataset')
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

  const [
    casesRawRows,
    recoveredRawRows,
    deathsRawRows
  ]: RawDataRow[][] = await Promise.all([
    CSV().fromStream(casesStream as any),
    CSV().fromStream(recoveredStream as any),
    CSV().fromStream(deathsStream as any)
  ])

  console.log('Dataset download finished. Processing...')
    // This function will normalize the raw dataset row into a structure that's easy to work with
  const normalizeRow = (row: RawDataRow): NormalizedDataRow => {
    return {
      country: row['Country/Region'],
      region: row['Province/State'],
      lat: parseFloat(row.Lat),
      lng: parseFloat(row.Long),
      data: Object.entries(row)
            .filter(([key]) => !RAW_ROW_META_COLUMNS.includes(key as RawRowMetaColumn))
            .reduce((dates, [ date, value ]) => {
              dates[moment(new Date(date)).format(DATE_FORMAT)] = parseInt(value) || 0
              return dates
            }, {} as { [date: string]: number })
    }
  }

  const casesRows = casesRawRows.map(row => normalizeRow(row))
  const deathsRows = deathsRawRows.map(row => normalizeRow(row))
  const recoveredRows = recoveredRawRows.map(row => normalizeRow(row))

  const places = await Place.find()

  const placesToSave: Place[] = []
  const placeDataToSave: PlaceData[] = []

  for (const casesRow of
    // Filter everything besides actual countries and states (no counties of cities for now) and rows with cases as 0
    casesRows.filter(r => Object.values(r.data).some(c => c > 0) && r.country !== 'Cruise Ship' && (!r.region || !/.*, [A-Za-z]{2}/g.test(r.region)))
  ) {
    const deathsRow = deathsRows.find(dr => dr.country === casesRow.country && dr.region === casesRow.region)
    const recoveredRow = recoveredRows.find(rr => rr.country === casesRow.country && rr.region === casesRow.region)

    const country = places.find(p => p.typeId === 'country' && p.code === COUNTRY_CODE_MAP[casesRow.country])
    if (!country) {
      console.error(`Country not found in DB`, casesRow.country, COUNTRY_CODE_MAP[casesRow.country])
      process.exit(1)
    }
    let region: Place
    if (!casesRow.region || casesRow.region === casesRow.country) {
      country.location = {
        type: 'Point',
        coordinates: [casesRow.lng, casesRow.lat]
      }
    } else {
      // Region row
      const name = casesRow.region
      const subId = dasherize(name.replace(/,|\.| /g, ''))
      region = new Place({
        id: `${country.id}-${subId}`,
        typeId: 'region',
        locales: {
          en: name
        },
        location: {
          type: 'Point',
          coordinates: [casesRow.lng, casesRow.lat]
        },
        parentId: country.id
      })
    }

    const place = region || country
    placesToSave.push(place)
    for (const [date, cases] of Object.entries(casesRow.data)) {
      const deaths = deathsRow.data[date] ?? 0
      const recovered = recoveredRow.data[date] ?? 0

      const existingPlaceData = placeDataToSave.find(pd => pd.placeId === place.id && pd.date === date)
      if (existingPlaceData) {
        existingPlaceData.cases += cases
        existingPlaceData.deaths += deaths
        existingPlaceData.recovered += recovered
      } else {
        placeDataToSave.push(new PlaceData({
          placeId: place.id,
          date,
          cases,
          deaths,
          recovered
        }))
      }

      let parentPlace = places.find(p => place.parentId === p.id)
      // Aggregate data for parent
      while (parentPlace) {
        const existingParentPlaceData = placeDataToSave.find(pd => pd.placeId === parentPlace.id && pd.date === date)
        if (existingParentPlaceData) {
          existingParentPlaceData.cases += cases
          existingParentPlaceData.deaths += deaths
          existingParentPlaceData.recovered += recovered
        } else {
          placeDataToSave.push(new PlaceData({
            placeId: parentPlace.id,
            date,
            cases,
            deaths,
            recovered
          }))
        }
        parentPlace = places.find(p => parentPlace.parentId === p.id)
      }
    }
  }

  console.log('Updating places')
  await Place.save(placesToSave)

  console.log('Ingesting data')
  await PlaceData.save(placeDataToSave, { chunk: 1000 })

})().catch(err => {
  console.error(err)
  debugger
  process.exit(1)
})
