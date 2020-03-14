import { action, observable, computed, set } from 'mobx'
import { Place } from '../../../shared/places'
import { PlaceApi } from '../utils/api/place'
import { LocalStorage } from '../utils/storage'
import { HTTP } from '../utils/http'

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
  private _selectedPlace: Place

  @computed
  get selectedPlace (): Place {
    return this._selectedPlace ?? LocalStorage.get('selectedPlace')
  }

  set selectedPlace (place: Place) {
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
      // TODO: If !this.selectedPlace, ask user for location
      // and get nearest from /places/closest

      const advice = await HTTP.request('GET', `/data/general-advice/${LocalStorage.get('locale') ?? 'en'}.json`)
      this.advice = advice

      const { data: rawGlobalData } = await PlaceApi.queryData('earth', { compact: true })
      this.rawGlobalData = rawGlobalData

      const { data: places } = await PlaceApi.query({
        typeId: 'country',
        include: ['children']
      })
      this.places = places
      this.lastUpdated = new Date()
      this.loadingStatus = LoadingStatus.HAS_LOADED
    } catch (err) {
      this.loadingStatus = LoadingStatus.HAS_ERRORED
    }
  }

  @action.bound
  destroy () {}
}
