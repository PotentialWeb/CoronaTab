abstract class BaseStorage {
  static storage: Storage

  static get (key: string) {
    let data: any = this.storage.getItem(key)
    try { data = JSON.parse(data) } catch { /**/ }
    return data
  }

  static set (key: string, item: any) {
    this.storage.setItem(key, JSON.stringify(item))
  }

  static delete (key: string) {
    this.storage.removeItem(key)
  }
}

export class LocalStorage extends BaseStorage {
  static storage = typeof window !== 'undefined' && window.localStorage
}

export class SessionStorage extends BaseStorage {
  static storage = typeof window !== 'undefined' && window.sessionStorage
}
