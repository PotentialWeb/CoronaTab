import { action, observable, computed } from 'mobx'
import allSettled from 'promise.allsettled'
import { Place as PlaceShape } from '@coronatab/shared'
import { PlaceApi } from '../utils/api/place'
import { LocalStorage } from '../utils/storage'
import { HTTP } from '../utils/http'
import moment from 'moment'

export enum LoadingStatus {
  IS_IDLE = 'isIdle',
  IS_LOADING = 'isLoading',
  HAS_LOADED = 'hasLoaded',
  HAS_ERRORED = 'hasErrored'
}

export type LocaleStringsObj = { [key: string]: string }
export type AdviceObj = { [key: string]: { title: string, description: string } }
export type RawPlaceDataObj = {
  lastFetched: string,
  data: (string | number)[]
}
export type RawPlaceData = {
  [key: string]: RawPlaceDataObj
}
export type CumulativeSeriesDataObj = { date: string, cases: number, deaths: number, recovered: number }
export type MergedCumulativeSeriesDataObj = {
  [key: string]: Omit<CumulativeSeriesDataObj, 'date'> | string
  date: string
}

export interface Place extends PlaceShape {
  latestData: {
    cases: number
    casesAsPercentageOfPopulation: number
    deaths: number
    deathsAsPercentageOfPopulation: number
    deathRate: number
    recovered: number
    recoveryRate: number
  }
  children: PlaceShape[]
}

export class DashboardPageStore {
  @observable
  loadingStatus = LoadingStatus.IS_LOADING

  @observable
  private _lastFetched: string

  @computed
  get lastFetched (): Date {
    const dateStr = this._lastFetched ?? LocalStorage.get('lastFetched')
    return dateStr && new Date(dateStr)
  }

  set lastFetched (date: Date) {
    this._lastFetched = date.toString()
    LocalStorage.set('lastFetched', date.toString())
  }

  static lastFetchedTTL = 600

  @observable
  private _countries: Place[]

  @computed
  get countries (): Place[] {
    return this._countries ?? LocalStorage.get('countries') ?? []
  }

  set countries (countries: Place[]) {
    this._countries = countries
    LocalStorage.set('countries', countries)
  }

  @observable
  startDate?: Date
  // startDate = moment().subtract(1, 'year').toDate()

  @observable
  endDate?: Date
  // endDate = moment().toDate()

  @observable
  private _localeStrings: LocaleStringsObj

  @computed
  get localeStrings (): LocaleStringsObj {
    if (typeof window === 'undefined') {
      // TODO: Return correct locale file depending on the language header or cookie
      return require('../../public/data/locale-strings/ru.json')
    } else {
      return this._localeStrings ?? LocalStorage.get('localeStrings')
    }
  }

  set localeStrings (localeStrings: LocaleStringsObj) {
    if (typeof window !== 'undefined') {
      this._localeStrings = localeStrings
      LocalStorage.set('localeStrings', localeStrings)
    }

  }

  @action.bound
  async init () {
    this.fetchInitialPageData()
  }

  @action.bound
  async fetchInitialPageData () {
    // Purge old keys from different version
    LocalStorage.purgeItems()

    try {
      const [
        countriesResult,
        localeStringsResult,
        globalDataResult,
        selectedPlaceResult
      ] = await allSettled([
        this.fetchCountries({ cached: true }),
        this.fetchLocaleStrings({ cached: true }),
        this.fetchRawPlaceData('earth'),
        !this.selectedPlace && PlaceApi.findClosest({ typeId: 'country', include: ['children'] })
      ])

      if (countriesResult.status === 'fulfilled') {
        const { data: countries } = countriesResult.value
        this.countries = countries
      } else {
        throw new Error('Could not get countries. API probably down.')
      }

      if (localeStringsResult.status === 'fulfilled') this.localeStrings = localeStringsResult.value
      if (globalDataResult.status === 'fulfilled') {
        const rawGlobalData = globalDataResult.value
        this.rawPlaceData = {
          ...this.rawPlaceData,
          earth: rawGlobalData
        }
      }

      if (selectedPlaceResult.status === 'fulfilled') {
        if (selectedPlaceResult.value?.data?.length) {
          this.selectedPlaceTree = [selectedPlaceResult.value.data[0]]
        }
      }

      // Data may be cached. Make a fresh request for
      // any cached data if cache is expired
      this.fetchUpdatedPageData()

      this.loadingStatus = LoadingStatus.HAS_LOADED
    } catch (err) {
      console.error(err)
      this.loadingStatus = LoadingStatus.HAS_ERRORED
    }
  }

  @action.bound
  async fetchUpdatedPageData () {
    if (this.lastFetched) {
      const nextFetchAt = moment(this.lastFetched).add(DashboardPageStore.lastFetchedTTL, 'seconds').toDate()
      if (nextFetchAt > new Date()) {
        console.info(`Not fetching new data until: ${nextFetchAt.toString()}`)
        return
      }
    }

    try {
      const [
        countriesResult,
        globalDataResult
      ] = await allSettled([
        this.fetchCountries({ cached: false }),
        this.fetchRawPlaceData('earth', { disableCache: true })
      ])

      if (countriesResult.status === 'fulfilled') {
        const { data: places } = countriesResult.value
        this.countries = places.map((place: PlaceShape) => DashboardPageStore.calcPlaceLatestDataComputedValues(place))
      }

      if (globalDataResult.status === 'fulfilled') {
        const rawGlobalData = globalDataResult.value
        this.rawPlaceData = {
          ...this.rawPlaceData,
          earth: rawGlobalData
        }
      }

      if (countriesResult.status === 'fulfilled' && globalDataResult.status === 'fulfilled') {
        this.lastFetched = new Date()
      }
    } catch (err) {
      console.error(err)
    }
  }

  @action.bound
  async fetchLocaleStrings ({ cached }: { cached: boolean }) {
    if (cached && this.localeStrings) return this.localeStrings
    return HTTP.request('GET', `/data/locale-strings/${LocalStorage.get('locale') ?? 'ru'}.json`)
  }

  @action.bound
  async fetchCountries ({ cached }: { cached: boolean }) {
    if (cached && this.countries.length) return { data: this.countries }
    return PlaceApi.query({ typeId: 'country', include: ['children'] })
  }

  @observable
  private _selectedPlaceTree: Place[]

  @computed
  get selectedPlaceTree (): Place[] {
    return this._selectedPlaceTree ?? LocalStorage.get('selectedPlaceTree') ?? []
  }

  set selectedPlaceTree (place: Place[]) {
    this._selectedPlaceTree = place
    LocalStorage.set('selectedPlaceTree', place)
  }

  @computed
  get selectedPlace () {
    const t = this.selectedPlaceTree
    return t.length > 0 && t[t.length - 1]
  }

  @observable
  private _rawPlaceData: RawPlaceData

  @computed
  get rawPlaceData (): RawPlaceData {
    return this._rawPlaceData ?? LocalStorage.get('rawPlaceData') ?? {}
  }

  set rawPlaceData (data: RawPlaceData) {
    this._rawPlaceData = data
    LocalStorage.set('rawPlaceData', data)
  }

  @action.bound
  async fetchRawPlaceData (id: string, opts?: { disableCache?: boolean }): Promise<RawPlaceDataObj> {
    if (opts?.disableCache !== true && this.rawPlaceData[id]) {
      if (this.rawPlaceData[id].lastFetched) {
        const nextFetchAt = moment(this.rawPlaceData[id].lastFetched).add(DashboardPageStore.lastFetchedTTL, 'seconds').toDate()
        if (nextFetchAt > new Date()) return this.rawPlaceData[id]
      }
    }
    const { data: rawData } = await PlaceApi.queryData(id, { compact: true })
    if (!Array.isArray(rawData)) throw new Error('rawData is not an array')
    const dataObj = {
      lastFetched: new Date().toString(),
      data: rawData
    }
    this.rawPlaceData = {
      ...this.rawPlaceData,
      [id]: dataObj
    }
    return dataObj
  }

  static calcPlaceLatestDataComputedValues (place: PlaceShape): Place {
    return {
      ...place,
      latestData: {
        ...place.latestData,
        casesAsPercentageOfPopulation: place.latestData.cases / place.population,
        deathRate: place.latestData.deaths / place.latestData.cases,
        deathsAsPercentageOfPopulation: place.latestData.deaths / place.population,
        recoveryRate: place.latestData.recovered / place.latestData.cases
      }
    }
  }

  static filterRawDataByDates (rawData: any[], startDate: Date, endDate: Date) {
    return rawData.filter(([date]) => {
      const d = new Date(date)
      return d >= startDate && d <= endDate
    })
  }

  static parseCumulativeSeriesData (rawData: any[]): CumulativeSeriesDataObj[] {
    return rawData.map(([date, cases, deaths, recovered]) => ({
      date,
      cases,
      deaths,
      recovered
    }), [])
  }

  static calcDailySeriesData (rawData: any[]) {
    return rawData
      .reduce((_data, [date, cases, deaths, recovered], i, rawData) => {
        const yesterday = rawData[_data.length - 1]
        return [
          ..._data,
          {
            date,
            cases: cases - (yesterday?.[1] ?? 0),
            deaths: deaths - (yesterday?.[2] ?? 0),
            recovered: recovered - (yesterday?.[3] ?? 0)
          }
        ]
      }, [])
  }

  // Merge multiple cumulativeSeriesDatas into one
  // {
  //   date: 'YYYY-MM-DD'
  //   [placeId]: {
  //     cases: number
  //     deaths: number
  //     recovered: number
  //   },
  //   ...
  // }

  static mergeCumulativeSeriesDatas (dataObj: { [placeId: string]: CumulativeSeriesDataObj[] }) {
    const merged = [] as MergedCumulativeSeriesDataObj[]
    for (const [placeId, data] of Object.entries(dataObj)) {
      for (const { date, ...datapoints } of data) {
        const existingObj = merged.find(({ date: _date }) => _date === date)
        const obj = existingObj || { date }
        obj[placeId] = datapoints
        if (!existingObj) merged.push(obj)
      }
    }
    return merged.sort((a, b) => moment(a.date) > moment(b.date) ? 1 : -1)
  }

  @action.bound
  destroy () {
    //
  }
}
