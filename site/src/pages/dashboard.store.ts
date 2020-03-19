import { action, observable, computed } from 'mobx'
import allSettled from 'promise.allsettled'
import { Place } from '@coronatab/shared'
import { PlaceApi, PlaceApiFindClosestQuery } from '../utils/api/place'
import { LocalStorage } from '../utils/storage'
import { HTTP } from '../utils/http'
import qs from 'qs'
import moment from 'moment'

export enum LoadingStatus {
  IS_LOADING = 'isLoading',
  HAS_LOADED = 'hasLoaded',
  HAS_ERRORED = 'hasErrored'
}

export type AdviceObj = { [key: string]: { title: string, description: string } }

export class DashboardPageStore {
  @observable
  loadingStatus = LoadingStatus.IS_LOADING

  @observable
  lastUpdated: Date

  @observable
  private _places: Place[]

  @computed
  get places (): Place[] {
    return this._places ?? LocalStorage.get('places') ?? []
  }

  set places (places: Place[]) {
    this._places = places
    LocalStorage.set('places', places)
  }

  @observable
  startDate?: Date
  // startDate = moment().subtract(1, 'year').toDate()

  @observable
  endDate?: Date
  // endDate = moment().toDate()

  @observable
  private _advice: AdviceObj

  @computed
  get advice (): AdviceObj {
    return this._advice ?? LocalStorage.get('advice')
  }

  set advice (advice: AdviceObj) {
    this._advice = advice
    LocalStorage.set('advice', advice)
  }

  @action.bound
  async init () {
    this.fetchPageData()
  }

  @action.bound
  async fetchPageData () {
    try {
      const advicePromise = this.fetchAdvice({ cached: true })
      const placesPromise = this.fetchPlaces({ cached: true })
      const globalDataPromise = this.fetchGlobalData({ cached: true })
      const closestPlacePromise = (() => {
        if (!this.selectedPlace) return PlaceApi.findClosest({ include: ['children'] })
      })

      const [
        placesResult,
        adviceResult,
        globalDataResult,
        selectedPlaceResult
      ] = await allSettled([
        placesPromise,
        advicePromise,
        globalDataPromise,
        closestPlacePromise
      ])

      if (placesResult.status === 'fulfilled') {
        const { data: places } = placesResult.value
        this.places = places
      } else {
        throw new Error('Could not get places. API probably down.')
      }

      if (adviceResult.status === 'fulfilled') this.advice = adviceResult.value
      if (globalDataResult.status === 'fulfilled') {
        const { data: rawGlobalData } = globalDataResult.value
        this.rawPlaceData = {
          ...this.rawPlaceData,
          earth: rawGlobalData
        }
      }
      if (selectedPlaceResult.status === 'fulfilled') {
        if (selectedPlaceResult.value?.length) {
          this.selectedPlaceTree = [selectedPlaceResult.value[0]]
        }
      }
      this.lastUpdated = new Date()
      this.loadingStatus = LoadingStatus.HAS_LOADED
    } catch (err) {
      console.error(err)
      this.loadingStatus = LoadingStatus.HAS_ERRORED
    }
  }

  @action.bound
  async fetchAdvice ({ cached }: { cached: boolean }) {
    if (cached && this.advice) return this.advice
    return HTTP.request('GET', `/data/general-advice/${LocalStorage.get('locale') ?? 'en'}.json`)
  }

  @action.bound
  async fetchPlaces ({ cached }: { cached: boolean }) {
    if (cached && this.places.length) return { data: this.places }
    return PlaceApi.query({ typeId: 'country', include: ['children'] })
  }

  @action.bound
  async fetchGlobalData ({ cached }: { cached: boolean }) {
    if (cached && this.rawPlaceData.earth) return { data: this.rawPlaceData.earth }
    return PlaceApi.queryData('earth', { compact: true })
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
  private _rawPlaceData: { [key: string]: any[] }

  @computed
  get rawPlaceData (): { [key: string]: any[] } {
    return this._rawPlaceData ?? LocalStorage.get('rawPlaceData') ?? {}
  }

  set rawPlaceData (data: { [key: string]: any[] }) {
    this._rawPlaceData = data
    LocalStorage.set('rawPlaceData', data)
  }

  @observable
  selectedPlaceDataLoadingStatus: LoadingStatus = LoadingStatus.IS_LOADING

  @action.bound
  async fetchSelectedPlaceData () {
    try {
      this.selectedPlaceDataLoadingStatus = LoadingStatus.IS_LOADING
      const { data: rawData } = await PlaceApi.queryData(this.selectedPlace.id, { compact: true })
      if (!Array.isArray(rawData)) throw new Error('rawData is not an array')
      this.rawPlaceData = {
        ...this.rawPlaceData,
        [this.selectedPlace.id]: rawData
      }
      this.selectedPlaceDataLoadingStatus = LoadingStatus.HAS_LOADED
      return rawData
    } catch (err) {
      this.selectedPlaceDataLoadingStatus = LoadingStatus.HAS_ERRORED
    }
  }

  static filterRawDataByDates(rawData: any[], startDate: Date, endDate: Date) {
    return rawData.filter(([date]) => {
      const d = new Date(date)
      return d >= startDate && d <= endDate
    })
  }

  static parseCumulativeSeriesData (rawData: any[]) {
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

  @action.bound
  destroy () {
    //
  }
}
