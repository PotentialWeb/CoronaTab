import { action, observable, computed } from 'mobx'
import { Place } from '../../../shared/places'
import { PlaceApi } from '../utils/api/place'
import { LocalStorage } from '../utils/storage'

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

  @action.bound
  async init () {
    this.fetchData()
  }

  @action.bound
  async fetchData () {
    try {
      const { data: places } = await PlaceApi.findAll()
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
