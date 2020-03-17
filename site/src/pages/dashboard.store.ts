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
  private _selectedPlace: Place[]

  @computed
  get selectedPlace (): Place[] {
    return this._selectedPlace ?? LocalStorage.get('selectedPlace')
  }

  set selectedPlace (place: Place[]) {
    this._selectedPlace = place
    LocalStorage.set('selectedPlace', place)
  }

  @observable
  private _selectedPlaceDetail: Place

  @computed
  get selectedPlaceDetail (): Place {
    return this._selectedPlaceDetail ?? LocalStorage.get('selectedPlaceDetail')
  }

  set selectedPlaceDetail (place: Place) {
    this._selectedPlaceDetail = place
    LocalStorage.set('selectedPlaceDetail', place)
  }

  @observable
  startDate = moment().subtract(3, 'months').toDate()

  @observable
  endDate = moment().toDate()

  @observable
  advice: { [key: string]: { title: string, description: string } } = {}

  @observable
  rawGlobalData: any[]

  @action.bound
  async init () {
    this.fetchData()
  }

  @action.bound
  async fetchData () {
    try {
      if (!this.selectedPlaceDetail) {
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
      this.selectedPlace = [selectedPlace]
      this.selectedPlaceDetail = selectedPlace
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

  @action.bound
  destroy () {
    //
  }
}
