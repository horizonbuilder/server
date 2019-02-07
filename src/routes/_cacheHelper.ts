import * as moment from 'moment';

export default class CacheHelper {
  private static lastUpdateTime: moment.Moment = null;

  static getLastUpdateTime() {
    return this.lastUpdateTime;
  }

  static setLastUpdateTime(timestamp) {
    if (timestamp > CacheHelper.lastUpdateTime) {
      CacheHelper.lastUpdateTime = timestamp;
    }
  }

  public static invalidateCache() {
    CacheHelper.setLastUpdateTime(moment());
  }
  public static checkCacheStatus() {
    return {
      lastUpdateTime: CacheHelper.getLastUpdateTime()
    };
  }
}
