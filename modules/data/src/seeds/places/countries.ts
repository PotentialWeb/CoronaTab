import { Place } from '../../models/place'
import { PlacePolygon } from '../../models/place/polygon'
import dasherize from 'dasherize'
import { LocaleTranslations } from '@coronatab/shared'
import * as path from 'path'

export const CountriesData: {
  locales: LocaleTranslations
  phoneCode: string
  alpha2code: string
  alpha3code: string
}[] = [
  {
    locales: {
      en: 'Afghanistan'
    },
    phoneCode: '+93',
    alpha2code: 'AF',
    alpha3code: 'AFG'
  },
  {
    locales: {
      en: 'Albania'
    },
    phoneCode: '+355',
    alpha2code: 'AL',
    alpha3code: 'ALB'
  },
  {
    locales: {
      en: 'Algeria'
    },
    phoneCode: '+213',
    alpha2code: 'DZ',
    alpha3code: 'DZA'
  },
  {
    locales: {
      en: 'American Samoa'
    },
    phoneCode: '+1',
    alpha2code: 'AS',
    alpha3code: 'ASM'
  },
  {
    locales: {
      en: 'Andorra'
    },
    phoneCode: '+376',
    alpha2code: 'AD',
    alpha3code: 'AND'
  },
  {
    locales: {
      en: 'Angola'
    },
    phoneCode: '+244',
    alpha2code: 'AO',
    alpha3code: 'AGO'
  },
  {
    locales: {
      en: 'Anguilla'
    },
    phoneCode: '+1',
    alpha2code: 'AI',
    alpha3code: 'AIA'
  },
  {
    locales: {
      en: 'Antigua and Barbuda'
    },
    phoneCode: '+1',
    alpha2code: 'AG',
    alpha3code: 'ATG'
  },
  {
    locales: {
      en: 'Argentina'
    },
    phoneCode: '+54',
    alpha2code: 'AR',
    alpha3code: 'ARG'
  },
  {
    locales: {
      en: 'Armenia'
    },
    phoneCode: '+374',
    alpha2code: 'AM',
    alpha3code: 'ARM'
  },
  {
    locales: {
      en: 'Aruba'
    },
    phoneCode: '+297',
    alpha2code: 'AW',
    alpha3code: 'ABW'
  },
  {
    locales: {
      en: 'Australia'
    },
    phoneCode: '+61',
    alpha2code: 'AU',
    alpha3code: 'AUS'
  },
  {
    locales: {
      en: 'Austria'
    },
    phoneCode: '+43',
    alpha2code: 'AT',
    alpha3code: 'AUT'
  },
  {
    locales: {
      en: 'Azerbaijan'
    },
    phoneCode: '+994',
    alpha2code: 'AZ',
    alpha3code: 'AZE'
  },
  {
    locales: {
      en: 'Bahrain'
    },
    phoneCode: '+973',
    alpha2code: 'BH',
    alpha3code: 'BHR'
  },
  {
    locales: {
      en: 'Bangladesh'
    },
    phoneCode: '+880',
    alpha2code: 'BD',
    alpha3code: 'BGD'
  },
  {
    locales: {
      en: 'Barbados'
    },
    phoneCode: '+1',
    alpha2code: 'BB',
    alpha3code: 'BRB'
  },
  {
    locales: {
      en: 'Belarus'
    },
    phoneCode: '+375',
    alpha2code: 'BY',
    alpha3code: 'BLR'
  },
  {
    locales: {
      en: 'Belgium'
    },
    phoneCode: '+32',
    alpha2code: 'BE',
    alpha3code: 'BEL'
  },
  {
    locales: {
      en: 'Belize'
    },
    phoneCode: '+501',
    alpha2code: 'BZ',
    alpha3code: 'BLZ'
  },
  {
    locales: {
      en: 'Benin'
    },
    phoneCode: '+229',
    alpha2code: 'BJ',
    alpha3code: 'BEN'
  },
  {
    locales: {
      en: 'Bermuda'
    },
    phoneCode: '+1',
    alpha2code: 'BM',
    alpha3code: 'BMU'
  },
  {
    locales: {
      en: 'Bhutan'
    },
    phoneCode: '+975',
    alpha2code: 'BT',
    alpha3code: 'BTN'
  },
  {
    locales: {
      en: 'Bolivia'
    },
    phoneCode: '+591',
    alpha2code: 'BO',
    alpha3code: 'BOL'
  },
  {
    locales: {
      en: 'Bonaire, Sint Eustatius and Saba'
    },
    phoneCode: '+599',
    alpha2code: 'BQ',
    alpha3code: 'BES'
  },
  {
    locales: {
      en: 'Bosnia and Herzegovina'
    },
    phoneCode: '+387',
    alpha2code: 'BA',
    alpha3code: 'BIH'
  },
  {
    locales: {
      en: 'Botswana'
    },
    phoneCode: '+267',
    alpha2code: 'BW',
    alpha3code: 'BWA'
  },
  {
    locales: {
      en: 'Brazil'
    },
    phoneCode: '+55',
    alpha2code: 'BR',
    alpha3code: 'BRA'
  },
  {
    locales: {
      en: 'British Indian Ocean Territory'
    },
    phoneCode: '+246',
    alpha2code: 'IO',
    alpha3code: 'IOT'
  },
  {
    locales: {
      en: 'British Virgin Islands'
    },
    phoneCode: '+1',
    alpha2code: 'VG',
    alpha3code: 'VGB'
  },
  {
    locales: {
      en: 'Brunei Darussalam'
    },
    phoneCode: '+673',
    alpha2code: 'BN',
    alpha3code: 'BRN'
  },
  {
    locales: {
      en: 'Bulgaria'
    },
    phoneCode: '+359',
    alpha2code: 'BG',
    alpha3code: 'BGR'
  },
  {
    locales: {
      en: 'Burkina Faso'
    },
    phoneCode: '+226',
    alpha2code: 'BF',
    alpha3code: 'BFA'
  },
  {
    locales: {
      en: 'Myanmar'
    },
    phoneCode: '+95',
    alpha2code: 'MM',
    alpha3code: 'MMR'
  },
  {
    locales: {
      en: 'Burundi'
    },
    phoneCode: '+257',
    alpha2code: 'BI',
    alpha3code: 'BDI'
  },
  {
    locales: {
      en: 'Cambodia'
    },
    phoneCode: '+855',
    alpha2code: 'KH',
    alpha3code: 'KHM'
  },
  {
    locales: {
      en: 'Cameroon'
    },
    phoneCode: '+237',
    alpha2code: 'CM',
    alpha3code: 'CMR'
  },
  {
    locales: {
      en: 'Canada'
    },
    phoneCode: '+1',
    alpha2code: 'CA',
    alpha3code: 'CAN'
  },
  {
    locales: {
      en: 'Cabo Verde'
    },
    phoneCode: '+238',
    alpha2code: 'CV',
    alpha3code: 'CPV'
  },
  {
    locales: {
      en: 'Cayman Islands'
    },
    phoneCode: '+1',
    alpha2code: 'KY',
    alpha3code: 'CYM'
  },
  {
    locales: {
      en: 'Central African Republic'
    },
    phoneCode: '+236',
    alpha2code: 'CF',
    alpha3code: 'CAF'
  },
  {
    locales: {
      en: 'Chad'
    },
    phoneCode: '+235',
    alpha2code: 'ID',
    alpha3code: 'TCD'
  },
  {
    locales: {
      en: 'Chile'
    },
    phoneCode: '+56',
    alpha2code: 'CL',
    alpha3code: 'CHL'
  },
  {
    locales: {
      en: 'China'
    },
    phoneCode: '+86',
    alpha2code: 'CN',
    alpha3code: 'CHN'
  },
  {
    locales: {
      en: 'Colombia'
    },
    phoneCode: '+57',
    alpha2code: 'CO',
    alpha3code: 'COL'
  },
  {
    locales: {
      en: 'Comoros'
    },
    phoneCode: '+269',
    alpha2code: 'KM',
    alpha3code: 'COM'
  },
  {
    locales: {
      en: 'Cook Islands'
    },
    phoneCode: '+682',
    alpha2code: 'CK',
    alpha3code: 'COK'
  },
  {
    locales: {
      en: 'Costa Rica'
    },
    phoneCode: '+506',
    alpha2code: 'CR',
    alpha3code: 'CRI'
  },
  {
    locales: {
      en: 'Cote dIvoire'
    },
    phoneCode: '+225',
    alpha2code: 'CI',
    alpha3code: 'CIV'
  },
  {
    locales: {
      en: 'Croatia'
    },
    phoneCode: '+385',
    alpha2code: 'HR',
    alpha3code: 'HRV'
  },
  {
    locales: {
      en: 'Cuba'
    },
    phoneCode: '+53',
    alpha2code: 'CU',
    alpha3code: 'CUB'
  },
  {
    locales: {
      en: 'Curacao'
    },
    phoneCode: '+599',
    alpha2code: 'CW',
    alpha3code: 'CUW'
  },
  {
    locales: {
      en: 'Cyprus'
    },
    phoneCode: '+357',
    alpha2code: 'CY',
    alpha3code: 'CYP'
  },
  {
    locales: {
      en: 'Czechia'
    },
    phoneCode: '+420',
    alpha2code: 'CZ',
    alpha3code: 'CZE'
  },
  {
    locales: {
      en: 'Denmark'
    },
    phoneCode: '+45',
    alpha2code: 'DK',
    alpha3code: 'DNK'
  },
  {
    locales: {
      en: 'Djibouti'
    },
    phoneCode: '+253',
    alpha2code: 'DJ',
    alpha3code: 'DJI'
  },
  {
    locales: {
      en: 'Dominica'
    },
    phoneCode: '+1',
    alpha2code: 'DM',
    alpha3code: 'DMA'
  },
  {
    locales: {
      en: 'Dominican Republic'
    },
    phoneCode: '+1',
    alpha2code: 'DO',
    alpha3code: 'DOM'
  },
  {
    locales: {
      en: 'Ecuador'
    },
    phoneCode: '+593',
    alpha2code: 'EC',
    alpha3code: 'ECU'
  },
  {
    locales: {
      en: 'Egypt'
    },
    phoneCode: '+20',
    alpha2code: 'EG',
    alpha3code: 'EGY'
  },
  {
    locales: {
      en: 'El Salvador'
    },
    phoneCode: '+503',
    alpha2code: 'SV',
    alpha3code: 'SLV'
  },
  {
    locales: {
      en: 'Equatorial Guinea'
    },
    phoneCode: '+240',
    alpha2code: 'GQ',
    alpha3code: 'GNQ'
  },
  {
    locales: {
      en: 'Eritrea'
    },
    phoneCode: '+291',
    alpha2code: 'ER',
    alpha3code: 'ERI'
  },
  {
    locales: {
      en: 'Estonia'
    },
    phoneCode: '+372',
    alpha2code: 'EE',
    alpha3code: 'EST'
  },
  {
    locales: {
      en: 'Eswatini'
    },
    phoneCode: '+268',
    alpha2code: 'SZ',
    alpha3code: 'SWZ'
  },
  {
    locales: {
      en: 'Ethiopia'
    },
    phoneCode: '+251',
    alpha2code: 'ET',
    alpha3code: 'ETH'
  },
  {
    locales: {
      en: 'Falkland Islands'
    },
    phoneCode: '+500',
    alpha2code: 'FK',
    alpha3code: 'FLK'
  },
  {
    locales: {
      en: 'Faroe Islands'
    },
    phoneCode: '+298',
    alpha2code: 'FO',
    alpha3code: 'FRO'
  },
  {
    locales: {
      en: 'Federated States of Micronesia'
    },
    phoneCode: '+691',
    alpha2code: 'FM',
    alpha3code: 'FSM'
  },
  {
    locales: {
      en: 'Fiji'
    },
    phoneCode: '+679',
    alpha2code: 'FJ',
    alpha3code: 'FJI'
  },
  {
    locales: {
      en: 'Finland'
    },
    phoneCode: '+358',
    alpha2code: 'FI',
    alpha3code: 'FIN'
  },
  {
    locales: {
      en: 'France'
    },
    phoneCode: '+33',
    alpha2code: 'FR',
    alpha3code: 'FRA'
  },
  {
    locales: {
      en: 'French Guiana'
    },
    phoneCode: '+594',
    alpha2code: 'GF',
    alpha3code: 'GUF'
  },
  {
    locales: {
      en: 'French Polynesia'
    },
    phoneCode: '+689',
    alpha2code: 'PF',
    alpha3code: 'PYF'
  },
  {
    locales: {
      en: 'Gabon'
    },
    phoneCode: '+241',
    alpha2code: 'GA',
    alpha3code: 'GAB'
  },
  {
    locales: {
      en: 'Georgia'
    },
    phoneCode: '+995',
    alpha2code: 'GE',
    alpha3code: 'GEO'
  },
  {
    locales: {
      en: 'Germany'
    },
    phoneCode: '+49',
    alpha2code: 'DE',
    alpha3code: 'DEU'
  },
  {
    locales: {
      en: 'Ghana'
    },
    phoneCode: '+233',
    alpha2code: 'GH',
    alpha3code: 'GHA'
  },
  {
    locales: {
      en: 'Gibraltar'
    },
    phoneCode: '+350',
    alpha2code: 'GI',
    alpha3code: 'GIB'
  },
  {
    locales: {
      en: 'Greece'
    },
    phoneCode: '+30',
    alpha2code: 'GR',
    alpha3code: 'GRC'
  },
  {
    locales: {
      en: 'Greenland'
    },
    phoneCode: '+299',
    alpha2code: 'GL',
    alpha3code: 'GRL'
  },
  {
    locales: {
      en: 'Grenada'
    },
    phoneCode: '+1',
    alpha2code: 'GD',
    alpha3code: 'GRD'
  },
  {
    locales: {
      en: 'Guadeloupe'
    },
    phoneCode: '+590',
    alpha2code: 'GP',
    alpha3code: 'GLP'
  },
  {
    locales: {
      en: 'Guam'
    },
    phoneCode: '+1',
    alpha2code: 'GU',
    alpha3code: 'GUM'
  },
  {
    locales: {
      en: 'Guatemala'
    },
    phoneCode: '+502',
    alpha2code: 'GT',
    alpha3code: 'GTM'
  },
  {
    locales: {
      en: 'Guernsey'
    },
    phoneCode: '+44',
    alpha2code: 'GG',
    alpha3code: 'GGY'
  },
  {
    locales: {
      en: 'Guinea'
    },
    phoneCode: '+224',
    alpha2code: 'GN',
    alpha3code: 'GIN'
  },
  {
    locales: {
      en: 'Guinea-Bissau'
    },
    phoneCode: '+245',
    alpha2code: 'GW',
    alpha3code: 'GNB'
  },
  {
    locales: {
      en: 'Guyana'
    },
    phoneCode: '+592',
    alpha2code: 'GY',
    alpha3code: 'GUY'
  },
  {
    locales: {
      en: 'Haiti'
    },
    phoneCode: '+509',
    alpha2code: 'HT',
    alpha3code: 'HTI'
  },
  {
    locales: {
      en: 'Honduras'
    },
    phoneCode: '+504',
    alpha2code: 'HN',
    alpha3code: 'HND'
  },
  {
    locales: {
      en: 'Hong Kong'
    },
    phoneCode: '+852',
    alpha2code: 'HK',
    alpha3code: 'HKG'
  },
  {
    locales: {
      en: 'Hungary'
    },
    phoneCode: '+36',
    alpha2code: 'HU',
    alpha3code: 'HUN'
  },
  {
    locales: {
      en: 'Iceland'
    },
    phoneCode: '+354',
    alpha2code: 'IS',
    alpha3code: 'ISL'
  },
  {
    locales: {
      en: 'India'
    },
    phoneCode: '+91',
    alpha2code: 'IN',
    alpha3code: 'IND'
  },
  {
    locales: {
      en: 'Indonesia'
    },
    phoneCode: '+62',
    alpha2code: 'ID',
    alpha3code: 'IDN'
  },
  {
    locales: {
      en: 'Iran'
    },
    phoneCode: '+98',
    alpha2code: 'IR',
    alpha3code: 'IRN'
  },
  {
    locales: {
      en: 'Iraq'
    },
    phoneCode: '+964',
    alpha2code: 'IQ',
    alpha3code: 'IRQ'
  },
  {
    locales: {
      en: 'Ireland'
    },
    phoneCode: '+353',
    alpha2code: 'IE',
    alpha3code: 'IRL'
  },
  {
    locales: {
      en: 'Israel'
    },
    phoneCode: '+972',
    alpha2code: 'IL',
    alpha3code: 'ISR'
  },
  {
    locales: {
      en: 'Italy'
    },
    phoneCode: '+39',
    alpha2code: 'IT',
    alpha3code: 'ITA'
  },
  {
    locales: {
      en: 'Jamaica'
    },
    phoneCode: '+1',
    alpha2code: 'JM',
    alpha3code: 'JAM'
  },
  {
    locales: {
      en: 'Japan'
    },
    phoneCode: '+81',
    alpha2code: 'JP',
    alpha3code: 'JPN'
  },
  {
    locales: {
      en: 'Jersey'
    },
    phoneCode: '+44',
    alpha3code: 'JEY',
    alpha2code: 'JE'
  },
  {
    locales: {
      en: 'Jordan'
    },
    phoneCode: '+962',
    alpha2code: 'JO',
    alpha3code: 'JOR'
  },
  {
    locales: {
      en: 'Kazakhstan'
    },
    phoneCode: '+7',
    alpha2code: 'KZ',
    alpha3code: 'KAZ'
  },
  {
    locales: {
      en: 'Kenya'
    },
    phoneCode: '+254',
    alpha2code: 'KE',
    alpha3code: 'KEN'
  },
  {
    locales: {
      en: 'Kiribati'
    },
    phoneCode: '+686',
    alpha2code: 'KI',
    alpha3code: 'KIR'
  },
  {
    locales: {
      en: 'Kosovo'
    },
    phoneCode: '+383',
    alpha2code: 'XK',
    alpha3code: 'XKX'
  },
  {
    locales: {
      en: 'Kuwait'
    },
    phoneCode: '+965',
    alpha2code: 'KW',
    alpha3code: 'KWT'
  },
  {
    locales: {
      en: 'Kyrgyzstan'
    },
    phoneCode: '+996',
    alpha2code: 'KG',
    alpha3code: 'KGZ'
  },
  {
    locales: {
      en: 'Laos'
    },
    phoneCode: '+856',
    alpha2code: 'LA',
    alpha3code: 'LAO'
  },
  {
    locales: {
      en: 'Latvia'
    },
    phoneCode: '+371',
    alpha2code: 'LV',
    alpha3code: 'LVA'
  },
  {
    locales: {
      en: 'Lebanon'
    },
    phoneCode: '+961',
    alpha2code: 'LB',
    alpha3code: 'LBN'
  },
  {
    locales: {
      en: 'Lesotho'
    },
    phoneCode: '+266',
    alpha2code: 'LS',
    alpha3code: 'LSO'
  },
  {
    locales: {
      en: 'Liberia'
    },
    phoneCode: '+231',
    alpha2code: 'LR',
    alpha3code: 'LBR'
  },
  {
    locales: {
      en: 'Libya'
    },
    phoneCode: '+218',
    alpha2code: 'LY',
    alpha3code: 'LBY'
  },
  {
    locales: {
      en: 'Liechtenstein'
    },
    phoneCode: '+423',
    alpha2code: 'LI',
    alpha3code: 'LIE'
  },
  {
    locales: {
      en: 'Lithuania'
    },
    phoneCode: '+370',
    alpha2code: 'LT',
    alpha3code: 'LTU'
  },
  {
    locales: {
      en: 'Luxembourg'
    },
    phoneCode: '+352',
    alpha2code: 'LU',
    alpha3code: 'LUX'
  },
  {
    locales: {
      en: 'Macao'
    },
    phoneCode: '+853',
    alpha2code: 'MO',
    alpha3code: 'MAC'
  },
  {
    locales: {
      en: 'Macedonia'
    },
    phoneCode: '+389',
    alpha2code: 'MK',
    alpha3code: 'MKD'
  },
  {
    locales: {
      en: 'Madagascar'
    },
    phoneCode: '+261',
    alpha2code: 'MG',
    alpha3code: 'MDG'
  },
  {
    locales: {
      en: 'Malawi'
    },
    phoneCode: '+265',
    alpha2code: 'MW',
    alpha3code: 'MWI'
  },
  {
    locales: {
      en: 'Malaysia'
    },
    phoneCode: '+60',
    alpha2code: 'MY',
    alpha3code: 'MYS'
  },
  {
    locales: {
      en: 'Maldives'
    },
    phoneCode: '+960',
    alpha2code: 'MV',
    alpha3code: 'MDV'
  },
  {
    locales: {
      en: 'Mali'
    },
    phoneCode: '+223',
    alpha2code: 'ML',
    alpha3code: 'MLI'
  },
  {
    locales: {
      en: 'Malta'
    },
    phoneCode: '+356',
    alpha2code: 'MT',
    alpha3code: 'MLT'
  },
  {
    locales: {
      en: 'Marshall Islands'
    },
    phoneCode: '+692',
    alpha2code: 'MH',
    alpha3code: 'MHL'
  },
  {
    locales: {
      en: 'Martinique'
    },
    phoneCode: '+596',
    alpha2code: 'MQ',
    alpha3code: 'MTQ'
  },
  {
    locales: {
      en: 'Mauritania'
    },
    phoneCode: '+222',
    alpha2code: 'MR',
    alpha3code: 'MRT'
  },
  {
    locales: {
      en: 'Mauritius'
    },
    phoneCode: '+230',
    alpha2code: 'MU',
    alpha3code: 'MUS'
  },
  {
    locales: {
      en: 'Mayotte'
    },
    phoneCode: '+262',
    alpha2code: 'YT',
    alpha3code: 'MYT'
  },
  {
    locales: {
      en: 'Mexico'
    },
    phoneCode: '+52',
    alpha2code: 'MX',
    alpha3code: 'MEX'
  },
  {
    locales: {
      en: 'Moldova'
    },
    phoneCode: '+373',
    alpha2code: 'MD',
    alpha3code: 'MDA'
  },
  {
    locales: {
      en: 'Monaco'
    },
    phoneCode: '+377',
    alpha2code: 'MC',
    alpha3code: 'MCO'
  },
  {
    locales: {
      en: 'Mongolia'
    },
    phoneCode: '+976',
    alpha2code: 'MN',
    alpha3code: 'MNG'
  },
  {
    locales: {
      en: 'Montenegro'
    },
    phoneCode: '+382',
    alpha2code: 'ME',
    alpha3code: 'MNE'
  },
  {
    locales: {
      en: 'Montserrat'
    },
    phoneCode: '+1',
    alpha2code: 'MS',
    alpha3code: 'MSR'
  },
  {
    locales: {
      en: 'Morocco'
    },
    phoneCode: '+212',
    alpha2code: 'MA',
    alpha3code: 'MAR'
  },
  {
    locales: {
      en: 'Mozambique'
    },
    phoneCode: '+258',
    alpha2code: 'MZ',
    alpha3code: 'MOZ'
  },
  {
    locales: {
      en: 'Namibia'
    },
    phoneCode: '+264',
    alpha2code: 'NA',
    alpha3code: 'NAM'
  },
  {
    locales: {
      en: 'Nauru'
    },
    phoneCode: '+674',
    alpha2code: 'NR',
    alpha3code: 'NRU'
  },
  {
    locales: {
      en: 'Nepal'
    },
    phoneCode: '+977',
    alpha2code: 'NP',
    alpha3code: 'NPL'
  },
  {
    locales: {
      en: 'Netherlands'
    },
    phoneCode: '+31',
    alpha2code: 'NL',
    alpha3code: 'NLD'
  },
  {
    locales: {
      en: 'Netherlands Antilles'
    },
    phoneCode: '+599',
    alpha2code: 'AN',
    alpha3code: 'ANT'
  },
  {
    locales: {
      en: 'New Caledonia'
    },
    phoneCode: '+687',
    alpha2code: 'NC',
    alpha3code: 'NCL'
  },
  {
    locales: {
      en: 'New Zealand'
    },
    phoneCode: '+64',
    alpha2code: 'NZ',
    alpha3code: 'NZL'
  },
  {
    locales: {
      en: 'Nicaragua'
    },
    phoneCode: '+505',
    alpha2code: 'NI',
    alpha3code: 'NIC'
  },
  {
    locales: {
      en: 'Niger'
    },
    phoneCode: '+227',
    alpha2code: 'NE',
    alpha3code: 'NER'
  },
  {
    locales: {
      en: 'Nigeria'
    },
    phoneCode: '+234',
    alpha2code: 'NG',
    alpha3code: 'NGA'
  },
  {
    locales: {
      en: 'Niue'
    },
    phoneCode: '+683',
    alpha2code: 'NU',
    alpha3code: 'NIU'
  },
  {
    locales: {
      en: 'Norfolk Island'
    },
    phoneCode: '+672',
    alpha2code: 'NF',
    alpha3code: 'NFK'
  },
  {
    locales: {
      en: 'North Korea'
    },
    phoneCode: '+850',
    alpha2code: 'KP',
    alpha3code: 'PRK'
  },
  {
    locales: {
      en: 'Northern Mariana Islands'
    },
    phoneCode: '+1',
    alpha2code: 'MP',
    alpha3code: 'MNP'
  },
  {
    locales: {
      en: 'Norway'
    },
    phoneCode: '+47',
    alpha2code: 'NO',
    alpha3code: 'NOR'
  },
  {
    locales: {
      en: 'Oman'
    },
    phoneCode: '+968',
    alpha2code: 'OM',
    alpha3code: 'OMN'
  },
  {
    locales: {
      en: 'Pakistan'
    },
    phoneCode: '+92',
    alpha2code: 'PK',
    alpha3code: 'PAK'
  },
  {
    locales: {
      en: 'Palau'
    },
    phoneCode: '+680',
    alpha2code: 'PW',
    alpha3code: 'PLW'
  },
  {
    locales: {
      en: 'Palestine'
    },
    phoneCode: '+970',
    alpha2code: 'PS',
    alpha3code: 'PSE'
  },
  {
    locales: {
      en: 'Panama'
    },
    phoneCode: '+507',
    alpha2code: 'PA',
    alpha3code: 'PAN'
  },
  {
    locales: {
      en: 'Papua New Guinea'
    },
    phoneCode: '+675',
    alpha2code: 'PG',
    alpha3code: 'PNG'
  },
  {
    locales: {
      en: 'Paraguay'
    },
    phoneCode: '+595',
    alpha2code: 'PY',
    alpha3code: 'PRY'
  },
  {
    locales: {
      en: 'Peru'
    },
    phoneCode: '+51',
    alpha2code: 'PE',
    alpha3code: 'PER'
  },
  {
    locales: {
      en: 'Philippines'
    },
    phoneCode: '+63',
    alpha2code: 'PH',
    alpha3code: 'PHL'
  },
  {
    locales: {
      en: 'Poland'
    },
    phoneCode: '+48',
    alpha2code: 'PL',
    alpha3code: 'POL'
  },
  {
    locales: {
      en: 'Portugal'
    },
    phoneCode: '+351',
    alpha2code: 'PT',
    alpha3code: 'PRT'
  },
  {
    locales: {
      en: 'Puerto Rico'
    },
    phoneCode: '+1',
    alpha2code: 'PR',
    alpha3code: 'PRI'
  },
  {
    locales: {
      en: 'Qatar'
    },
    phoneCode: '+974',
    alpha2code: 'QA',
    alpha3code: 'QAT'
  },
  {
    locales: {
      en: 'Democratic Republic of the Congo'
    },
    phoneCode: '+243',
    alpha2code: 'CD',
    alpha3code: 'COD'
  },
  {
    locales: {
      en: 'Republic of Congo'
    },
    phoneCode: '+242',
    alpha2code: 'CG',
    alpha3code: 'COG'
  },
  {
    locales: {
      en: 'Reunion'
    },
    phoneCode: '+262',
    alpha2code: 'RE',
    alpha3code: 'REU'
  },
  {
    locales: {
      en: 'Romania'
    },
    phoneCode: '+40',
    alpha2code: 'RO',
    alpha3code: 'ROU'
  },
  {
    locales: {
      en: 'Russia'
    },
    phoneCode: '+7',
    alpha2code: 'RU',
    alpha3code: 'RUS'
  },
  {
    locales: {
      en: 'Rwanda'
    },
    phoneCode: '+250',
    alpha2code: 'RW',
    alpha3code: 'RWA'
  },
  {
    locales: {
      en: 'Saint Barthelemy'
    },
    phoneCode: '+590',
    alpha2code: 'BL',
    alpha3code: 'BLM'
  },
  {
    locales: {
      en: 'Saint Helena'
    },
    phoneCode: '+290',
    alpha2code: 'SH',
    alpha3code: 'SHN'
  },
  {
    locales: {
      en: 'Saint Kitts and Nevis'
    },
    phoneCode: '+1',
    alpha2code: 'KN',
    alpha3code: 'KNA'
  },
  {
    locales: {
      en: 'Saint Martin'
    },
    phoneCode: '+590',
    alpha2code: 'MF',
    alpha3code: 'MAF'
  },
  {
    locales: {
      en: 'Saint Pierre and Miquelon'
    },
    phoneCode: '+508',
    alpha2code: 'PM',
    alpha3code: 'SPM'
  },
  {
    locales: {
      en: 'Saint Vincent and the Grenadines'
    },
    phoneCode: '+1',
    alpha2code: 'VC',
    alpha3code: 'VCT'
  },
  {
    locales: {
      en: 'Samoa'
    },
    phoneCode: '+685',
    alpha2code: 'WS',
    alpha3code: 'WSM'
  },
  {
    locales: {
      en: 'San Marino'
    },
    phoneCode: '+378',
    alpha2code: 'SM',
    alpha3code: 'SMR'
  },
  {
    locales: {
      en: 'Sao Tome and Principe'
    },
    phoneCode: '+239',
    alpha2code: 'ST',
    alpha3code: 'STP'
  },
  {
    locales: {
      en: 'Saudi Arabia'
    },
    phoneCode: '+966',
    alpha2code: 'SA',
    alpha3code: 'SAU'
  },
  {
    locales: {
      en: 'Senegal'
    },
    phoneCode: '+221',
    alpha2code: 'SN',
    alpha3code: 'SEN'
  },
  {
    locales: {
      en: 'Serbia'
    },
    phoneCode: '+381',
    alpha2code: 'RS',
    alpha3code: 'SRB'
  },
  {
    locales: {
      en: 'Seychelles'
    },
    phoneCode: '+248',
    alpha2code: 'SC',
    alpha3code: 'SYC'
  },
  {
    locales: {
      en: 'Sierra Leone'
    },
    phoneCode: '+232',
    alpha2code: 'SL',
    alpha3code: 'SLE'
  },
  {
    locales: {
      en: 'Singapore'
    },
    phoneCode: '+65',
    alpha2code: 'SG',
    alpha3code: 'SGP'
  },
  {
    locales: {
      en: 'Sint Maarten (Dutch part)'
    },
    phoneCode: '+1',
    alpha2code: 'SX',
    alpha3code: 'SXM'
  },
  {
    locales: {
      en: 'Slovakia'
    },
    phoneCode: '+421',
    alpha2code: 'SK',
    alpha3code: 'SVK'
  },
  {
    locales: {
      en: 'Slovenia'
    },
    phoneCode: '+386',
    alpha2code: 'SI',
    alpha3code: 'SVN'
  },
  {
    locales: {
      en: 'Solomon Islands'
    },
    phoneCode: '+677',
    alpha2code: 'SB',
    alpha3code: 'SLB'
  },
  {
    locales: {
      en: 'Somalia'
    },
    phoneCode: '+252',
    alpha2code: 'SO',
    alpha3code: 'SOM'
  },
  {
    locales: {
      en: 'South Africa'
    },
    phoneCode: '+27',
    alpha2code: 'ZA',
    alpha3code: 'ZAF'
  },
  {
    locales: {
      en: 'South Korea'
    },
    phoneCode: '+82',
    alpha2code: 'KR',
    alpha3code: 'KOR'
  },
  {
    locales: {
      en: 'South Sudan'
    },
    phoneCode: '+211',
    alpha2code: 'SS',
    alpha3code: 'SSD'
  },
  {
    locales: {
      en: 'Spain'
    },
    phoneCode: '+34',
    alpha2code: 'ES',
    alpha3code: 'ESP'
  },
  {
    locales: {
      en: 'Sri Lanka'
    },
    phoneCode: '+94',
    alpha2code: 'LK',
    alpha3code: 'LKA'
  },
  {
    locales: {
      en: 'Saint Lucia'
    },
    phoneCode: '+1',
    alpha2code: 'LC',
    alpha3code: 'LCA'
  },
  {
    locales: {
      en: 'Sudan'
    },
    phoneCode: '+249',
    alpha2code: 'SD',
    alpha3code: 'SDN'
  },
  {
    locales: {
      en: 'Suriname'
    },
    phoneCode: '+597',
    alpha2code: 'SR',
    alpha3code: 'SUR'
  },
  {
    locales: {
      en: 'Swaziland'
    },
    phoneCode: '+268',
    alpha2code: 'SZ',
    alpha3code: 'SWZ'
  },
  {
    locales: {
      en: 'Sweden'
    },
    phoneCode: '+46',
    alpha2code: 'SE',
    alpha3code: 'SWE'
  },
  {
    locales: {
      en: 'Switzerland'
    },
    phoneCode: '+41',
    alpha2code: 'CH',
    alpha3code: 'CHE'
  },
  {
    locales: {
      en: 'Syrian Arab Republic'
    },
    phoneCode: '+963',
    alpha2code: 'SY',
    alpha3code: 'SYR'
  },
  {
    locales: {
      en: 'Taiwan'
    },
    phoneCode: '+886',
    alpha2code: 'TW',
    alpha3code: 'TWN'
  },
  {
    locales: {
      en: 'Tajikistan'
    },
    phoneCode: '+992',
    alpha2code: 'TJ',
    alpha3code: 'TJK'
  },
  {
    locales: {
      en: 'Tanzania'
    },
    phoneCode: '+255',
    alpha2code: 'TZ',
    alpha3code: 'TZA'
  },
  {
    locales: {
      en: 'Thailand'
    },
    phoneCode: '+66',
    alpha2code: 'TH',
    alpha3code: 'THA'
  },
  {
    locales: {
      en: 'Bahamas'
    },
    phoneCode: '+1',
    alpha2code: 'BS',
    alpha3code: 'BHS'
  },
  {
    locales: {
      en: 'Gambia'
    },
    phoneCode: '+220',
    alpha2code: 'GM',
    alpha3code: 'GMB'
  },
  {
    locales: {
      en: 'Timor-Leste'
    },
    phoneCode: '+670',
    alpha2code: 'TL',
    alpha3code: 'TLS'
  },
  {
    locales: {
      en: 'Togo'
    },
    phoneCode: '+228',
    alpha2code: 'TG',
    alpha3code: 'TGO'
  },
  {
    locales: {
      en: 'Tokelau'
    },
    phoneCode: '+690',
    alpha2code: 'TK',
    alpha3code: 'TKL'
  },
  {
    locales: {
      en: 'Tonga'
    },
    phoneCode: '+676',
    alpha2code: 'TO',
    alpha3code: 'TON'
  },
  {
    locales: {
      en: 'Trinidad and Tobago'
    },
    phoneCode: '+1',
    alpha2code: 'TT',
    alpha3code: 'TTO'
  },
  {
    locales: {
      en: 'Tunisia'
    },
    phoneCode: '+216',
    alpha2code: 'TN',
    alpha3code: 'TUN'
  },
  {
    locales: {
      en: 'Turkey'
    },
    phoneCode: '+90',
    alpha2code: 'TR',
    alpha3code: 'TUR'
  },
  {
    locales: {
      en: 'Turkmenistan'
    },
    phoneCode: '+993',
    alpha2code: 'TM',
    alpha3code: 'TKM'
  },
  {
    locales: {
      en: 'Turks and Caicos Islands'
    },
    phoneCode: '+1',
    alpha2code: 'TC',
    alpha3code: 'TCA'
  },
  {
    locales: {
      en: 'Tuvalu'
    },
    phoneCode: '+688',
    alpha2code: 'TV',
    alpha3code: 'TUV'
  },
  {
    locales: {
      en: 'Uganda'
    },
    phoneCode: '+256',
    alpha2code: 'UG',
    alpha3code: 'UGA'
  },
  {
    locales: {
      en: 'Ukraine'
    },
    phoneCode: '+380',
    alpha2code: 'UA',
    alpha3code: 'UKR'
  },
  {
    locales: {
      en: 'United Arab Emirates'
    },
    phoneCode: '+971',
    alpha2code: 'AE',
    alpha3code: 'ARE'
  },
  {
    locales: {
      en: 'United Kingdom'
    },
    phoneCode: '+44',
    alpha2code: 'GB',
    alpha3code: 'GBR'
  },
  {
    locales: {
      en: 'United States'
    },
    phoneCode: '+1',
    alpha2code: 'US',
    alpha3code: 'USA'
  },
  {
    locales: {
      en: 'Uruguay'
    },
    phoneCode: '+598',
    alpha2code: 'UY',
    alpha3code: 'URY'
  },
  {
    locales: {
      en: 'US Virgin Islands'
    },
    phoneCode: '+1',
    alpha2code: 'VI',
    alpha3code: 'VIR'
  },
  {
    locales: {
      en: 'Uzbekistan'
    },
    phoneCode: '+998',
    alpha2code: 'UZ',
    alpha3code: 'UZB'
  },
  {
    locales: {
      en: 'Vanuatu'
    },
    phoneCode: '+678',
    alpha2code: 'VU',
    alpha3code: 'VUT'
  },
  {
    locales: {
      en: 'Vatican City'
    },
    phoneCode: '+39',
    alpha2code: 'VA',
    alpha3code: 'VAT'
  },
  {
    locales: {
      en: 'Venezuela'
    },
    phoneCode: '+58',
    alpha2code: 'VE',
    alpha3code: 'VEN'
  },
  {
    locales: {
      en: 'Vietnam'
    },
    phoneCode: '+84',
    alpha2code: 'VN',
    alpha3code: 'VNM'
  },
  {
    locales: {
      en: 'Wallis and Futuna'
    },
    phoneCode: '+681',
    alpha2code: 'WF',
    alpha3code: 'WLF'
  },
  {
    locales: {
      en: 'Yemen'
    },
    phoneCode: '+967',
    alpha2code: 'YE',
    alpha3code: 'YEM'
  },
  {
    locales: {
      en: 'Zambia'
    },
    phoneCode: '+260',
    alpha2code: 'ZM',
    alpha3code: 'ZMB'
  },
  {
    locales: {
      en: 'Zimbabwe'
    },
    phoneCode: '+263',
    alpha2code: 'ZW',
    alpha3code: 'ZWE'
  }
]

const SeededCountryPolygons: PlacePolygon[] = []
const SeededCountries: Place[] = []

const CountyPolygons = require(path.resolve(__dirname + '/country-polygons.json'))
CountriesData.map(country => {
  const id = dasherize(country.locales.en.replace(/,|\.| /g, ''))

  const Country = new Place({
    id,
    locales: country.locales,
    code: country.alpha2code,
    typeId: 'country',
    parentId: 'earth'
  })

  const countryPolygon = CountyPolygons.find(c => c.alpha3code === country.alpha3code)

  if (countryPolygon) {
    const CountryPolygon = new PlacePolygon({
      placeId: id,
      polygon: countryPolygon.polygon
    })
    SeededCountryPolygons.push(CountryPolygon)
  }

  SeededCountries.push(Country)
})

export { SeededCountryPolygons, SeededCountries }
