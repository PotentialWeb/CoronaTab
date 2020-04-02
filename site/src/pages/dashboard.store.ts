import { action, observable, computed } from 'mobx'
import allSettled from 'promise.allsettled'
import { AppStore } from './_app.store'
import { Place as PlaceShape } from '@coronatab/shared'
import { PlaceApi } from '../utils/api/place'
import { LocalStorage } from '../utils/storage'
import moment from 'moment'

export enum LoadingStatus {
  IS_IDLE = 'isIdle',
  IS_LOADING = 'isLoading',
  HAS_LOADED = 'hasLoaded',
  HAS_ERRORED = 'hasErrored'
}

export type CountriesObj = {
  lastFetched: string
  locale: string
  data: Place[]
}

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
  constructor (public appStore: AppStore) {}

  @observable
  loadingStatus = LoadingStatus.IS_LOADING

  static lastFetchedTTL = 600

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
        globalDataResult,
        selectedPlaceResult
      ] = await allSettled([
        this.fetchCountries(),
        this.fetchRawPlaceData('earth'),
        !this.selectedPlace && PlaceApi.findClosest({ typeId: 'country', include: ['children'] })
      ])

      if (countriesResult.status === 'fulfilled') {
        const countriesObj = countriesResult.value
        this.countries = countriesObj
      } else {
        console.error(countriesResult.reason)
        throw new Error('Could not get countries. API probably down.')
      }

      if (globalDataResult.status === 'fulfilled') {
        const rawGlobalData = globalDataResult.value
        this.rawPlaceData = {
          ...this.rawPlaceData,
          earth: rawGlobalData
        }
      } else {
        console.error(globalDataResult.reason)
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
    try {
      const [
        countriesResult,
        globalDataResult
      ] = await allSettled([
        this.fetchCountries({ disableCache: true }),
        this.fetchRawPlaceData('earth', { disableCache: true })
      ])

      if (countriesResult.status === 'fulfilled') {
        this.countries = countriesResult.value
      }

      if (globalDataResult.status === 'fulfilled') {
        const rawGlobalData = globalDataResult.value
        this.rawPlaceData = {
          ...this.rawPlaceData,
          earth: rawGlobalData
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  @observable
  private _countries: CountriesObj

  @computed
  get countries (): CountriesObj {
    return this._countries ?? LocalStorage.get('countries') ?? { data: [] }
  }

  set countries (countries: CountriesObj) {
    this._countries = countries
    LocalStorage.set('countries', countries)
  }

  @action.bound
  async fetchCountries (opts: { disableCache?: boolean } = {}) {
    if (opts?.disableCache !== true && this.countries.data.length && this.appStore.locale === this.countries.locale) {
      if (this.countries.lastFetched) {
        const nextFetchAt = moment(this.countries.lastFetched).add(DashboardPageStore.lastFetchedTTL, 'seconds').toDate()
        if (nextFetchAt > new Date()) return this.countries
      }
    }
    const { data: places } = await PlaceApi.query({ typeId: 'country', include: ['children'] })
    return {
      lastFetched: new Date().toString(),
      locale: this.appStore.locale,
      data: places.map((place: PlaceShape) => DashboardPageStore.calcPlaceLatestDataComputedValues(place))
    }
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
    const { data: rawData, meta: { projected } } = await PlaceApi.queryData(id, { compact: true })
    if (!Array.isArray(rawData)) throw new Error('rawData is not an array')
    const dataObj = {
      lastFetched: new Date().toString(),
      data: rawData,
      projected
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
