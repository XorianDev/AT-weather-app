import { Injectable } from "@angular/core";

import { CurrentConditions } from "./current-conditions/current-conditions.type";
import { Forecast } from "./forecasts-list/forecast.type";

@Injectable({
  providedIn: "root"
})
export class CacheService {
  // Modify this value to store for more/less time (default 7200000ms = 2 hours)
  private _cacheDuration: number = 7200000;

  public save(key: string, data: CurrentConditions | Forecast): void  {
    const expiration = new Date().getTime() + this._cacheDuration;
    const item = { data, expiration };

    localStorage.setItem(key, JSON.stringify(item));
  }

  public get(key: string): CurrentConditions | Forecast {
    const itemString = localStorage.getItem(key);
    if (!itemString) return null;

    const item = JSON.parse(itemString);
    const currentTime = new Date().getTime();

    if (currentTime > item.expiration) {
      localStorage.removeItem(key);
      return null;
    }

    return item.data;
  }
}