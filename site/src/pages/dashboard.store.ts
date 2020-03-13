import { action, observable } from 'mobx'
import { Place } from '../../../shared/places'
import { PlaceApi } from '../utils/api/place'

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
  selectedPlace: Place

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
