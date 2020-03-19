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

export class DashboardPageStore {
  @observable
  loadingStatus = LoadingStatus.IS_LOADING

  @observable
  lastUpdated: Date

  @observable
  places: Place[] = []

  @observable
  startDate?: Date
  // startDate = moment().subtract(1, 'year').toDate()

  @observable
  endDate?: Date
  // endDate = moment().toDate()

  @observable
  advice: { [key: string]: { title: string, description: string } } = {}

  @observable
  rawGlobalData: any[]

  @action.bound
  async init () {
    this.fetchPageData()
  }

  @action.bound
  async fetchPageData () {
    try {
      if (!this.selectedPlace) {
        await this.fetchAndSetClosestPlace()
      }

      const advicePromise = HTTP.request('GET', `/data/general-advice/${LocalStorage.get('locale') ?? 'en'}.json`)
      const placesPromise = PlaceApi.query({ typeId: 'country', include: ['children'] })
      const globalDataPromise = PlaceApi.queryData('earth', { compact: true })

      const [
        placesResult,
        adviceResult,
        globalDataResult
      ] = await allSettled([
        placesPromise,
        advicePromise,
        globalDataPromise
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
        this.rawGlobalData = rawGlobalData
      }

      this.lastUpdated = new Date()
      this.loadingStatus = LoadingStatus.HAS_LOADED
    } catch (err) {
      console.error(err)
      this.loadingStatus = LoadingStatus.HAS_ERRORED
    }
  }

  @action.bound
  async fetchAndSetClosestPlace () {
    let query: PlaceApiFindClosestQuery = {
      include: ['children' as 'children']
    }
    const { lng, lat } = qs.parse(window.location.search.replace(/\?(.*)$/, '$1'))

    if (lng && lat) {
      query = { ...query, lng, lat }
    } else {
      try {
        const { lng, lat } = await this.requestCurrentLocation()
        query = { ...query, lng, lat }
      } catch (err) {
        console.warn('User did not authorize geolocation API', err)
      }
    }

    try {
      const { data: places } = await PlaceApi.findClosest(query)
      if (!places?.length) throw new Error('No closest places returned')
      const selectedPlace = places[0]
      this.selectedPlaceTree = [selectedPlace]
    } catch (err) {
      console.warn(err)
    }
  }

  async requestCurrentLocation (): Promise<{ lng: number, lat: number}> {
    return new Promise((resolve, reject) => (
      navigator.geolocation.getCurrentPosition(position => (
        resolve({
          lng: position.coords.longitude,
          lat: position.coords.latitude
        })
      ), err => reject(err)
    )))
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
      this.rawPlaceData[this.selectedPlace.id] = rawData
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
