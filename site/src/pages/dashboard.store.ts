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
  lastFetched?: string
  locale?: string
  data: Place[]
}

export type SelectedPlacesObj = {
  lastFetched?: string
  locale?: string
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

  static lastFetchedTTL = 3600

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
        selectedPlacesResult
      ] = await allSettled([
        this.fetchCountries(),
        this.fetchRawPlaceData('earth'),
        this.fetchSelectedPlaces()
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

      if (selectedPlacesResult.status === 'fulfilled') {
        const selectedPlacesObj = selectedPlacesResult.value
        this.selectedPlaces = selectedPlacesObj
      } else {
        this.selectedPlaces = { data: [] }
        console.error(selectedPlacesResult.reason)
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
  async fetchCountries (opts: { disableCache?: boolean } = {}): Promise<CountriesObj> {
    // If we should try to load from cache and countries are loaded and locale matches
    if (opts?.disableCache !== true && this.countries.data.length && this.appStore.locale === this.countries.locale) {
      // ...and if cache has not expired
      if (this.countries.lastFetched) {
        const nextFetchAt = moment(this.countries.lastFetched).add(DashboardPageStore.lastFetchedTTL, 'seconds').toDate()
        // ...then return cached countries
        if (nextFetchAt > new Date()) return this.countries
      }
    }
    // Else fetch countries
    const { data: places } = await PlaceApi.query({ typeId: 'country', include: ['children'] })
    return {
      lastFetched: new Date().toString(),
      locale: this.appStore.locale,
      data: places.map((place: PlaceShape) => DashboardPageStore.calcPlaceLatestDataComputedValues(place))
    }
  }

  @observable
  private _selectedPlaces: SelectedPlacesObj

  @computed
  get selectedPlaces (): SelectedPlacesObj {
    return this._selectedPlaces ?? LocalStorage.get('selectedPlaces') ?? { data: [] }
  }

  set selectedPlaces (obj: SelectedPlacesObj) {
    this._selectedPlaces = obj
    LocalStorage.set('selectedPlaces', obj)
  }

  @computed
  get selectedPlace () {
    const t = this.selectedPlaces.data
    return t.length > 0 && t[t.length - 1]
  }

  @action.bound
  async fetchSelectedPlaces (opts: { disableCache?: boolean } = {}): Promise<SelectedPlacesObj> {
    // If we should try to load from cache and locale matches
    if (opts?.disableCache !== true && this.appStore.locale === this.selectedPlaces.locale) {
      // ...and if cache has not expired
      if (this.selectedPlaces.lastFetched) {
        const nextFetchAt = moment(this.selectedPlaces.lastFetched).add(DashboardPageStore.lastFetchedTTL, 'seconds').toDate()
        // ...then return cached places
        if (nextFetchAt > new Date()) return this.selectedPlaces
      }
    }
    let selectedPlaces = {
      lastFetched: new Date().toString(),
      locale: this.appStore.locale,
      data: []
    }
    // Else if there's no currently selected place
    if (!this.selectedPlace) {
      // ...find user's closest place
      const { data: places } = await PlaceApi.findClosest({ typeId: 'country', include: ['children'] })
      // ...and if we find one
      if (places.length) {
        // ...then set it and return
        selectedPlaces.data.push(places[0])
        selectedPlaces.lastFetched = new Date().toString()
      }
    // Else if there's currently selected places
    } else {
      // Get latest data for each
      const placeResults = await Promise.all(
        this.selectedPlaces.data.map(({ id }) => (
          PlaceApi.find(id)
        ))
      )
      selectedPlaces.data = placeResults.map(({ data }) => data as Place).filter(place => place?.id)
      selectedPlaces.lastFetched = new Date().toString()
    }
    return selectedPlaces
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
    // If we should try to load from cache and rawPlaceData entry exists
    if (opts?.disableCache !== true && this.rawPlaceData[id]) {
      // ...and if cache has not expired
      if (this.rawPlaceData[id].lastFetched) {
        const nextFetchAt = moment(this.rawPlaceData[id].lastFetched).add(DashboardPageStore.lastFetchedTTL, 'seconds').toDate()
        // ...then return cached data
        if (nextFetchAt > new Date()) return this.rawPlaceData[id]
      }
    }
    // Else fetch data
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
