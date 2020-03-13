import { action, observable } from 'mobx'

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
  selectedPlace: Place

  @action.bound
  async init () {
    this.fetchData()
  }

  @action.bound
  async fetchData () {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.lastUpdated = new Date()
      this.loadingStatus = LoadingStatus.HAS_LOADED
    } catch (err) {
      this.loadingStatus = LoadingStatus.HAS_ERRORED
    }
  }

  @action.bound
  destroy () {}
}
