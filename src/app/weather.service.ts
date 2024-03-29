import {Injectable, Signal, effect, signal} from '@angular/core';
import {Observable, of} from 'rxjs';
import { take, tap } from 'rxjs/operators';

import {HttpClient} from '@angular/common/http';
import { LocationService } from './location.service';
import { CacheService } from './cache.service';
import {CurrentConditions} from './current-conditions/current-conditions.type';
import {ConditionsAndZip} from './conditions-and-zip.type';
import {Forecast} from './forecasts-list/forecast.type';

@Injectable()
export class WeatherService {

  static URL = 'https://api.openweathermap.org/data/2.5';
  static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';
  private currentConditions = signal<ConditionsAndZip[]>([]);
  private currentLocations: string[] = [];

  constructor(
    private http: HttpClient, 
    private locationService: LocationService, 
    private cacheService: CacheService) {
    // Adding locations already saved on localstorage
    this.currentLocations = this.locationService.locations();
    if (this.currentLocations) {
      for (let loc of this.currentLocations) {
        this.addCurrentConditions(loc);
      }
    }

    // Listening for changes on the locations list
    effect(() => {
      let newLocations: string[] = this.locationService.locations();
      
      let changes: string[] = this.currentLocations.filter(loc => !newLocations.includes(loc))
                        .concat(newLocations.filter(loc => !this.currentLocations.includes(loc)));

      if (changes) {
        if (this.currentLocations.length > newLocations.length) {
          this.removeCurrentConditions(changes.pop());
        }
        if (newLocations.length > this.currentLocations.length) {
          this.addCurrentConditions(changes.pop());
        }

        this.currentLocations = newLocations;
      }
    }, {allowSignalWrites: true});
  }


  addCurrentConditions(zipcode: string): void {
    const key: string = `conditions_${zipcode}`;
    const cachedData = this.cacheService.get<CurrentConditions>(key);
    if (cachedData) {
      this.currentConditions.update(conditions => [...conditions, { zip: zipcode, data: cachedData }]);
    } else {
      // Here we make a request to get the current conditions data from the API. Note the use of backticks and an expression to insert the zipcode
      this.http.get<CurrentConditions>(`${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`)
      .pipe(take(1))
      .subscribe(data => {
        this.currentConditions.update(conditions => [...conditions, {zip: zipcode, data}]);
        this.cacheService.save<CurrentConditions>(key, data);
      });
    }
  }

  removeCurrentConditions(zipcode: string) {
    this.currentConditions.update(conditions => {
      for (let i in conditions) {
        if (conditions[i].zip == zipcode)
          conditions.splice(+i, 1);
      }
      return conditions;
    })
  }

  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getForecast(zipcode: string): Observable<Forecast> {
    const key: string = `forecast_${zipcode}`;
    const cachedData = this.cacheService.get<Forecast>(key);
    if (cachedData) return of(cachedData);
    // Here we make a request to get the forecast data from the API. Note the use of backticks and an expression to insert the zipcode
    return this.http.get<Forecast>(`${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`).
      pipe(
        tap(
          forecast => this.cacheService.save<Forecast>(key, forecast)
        )
      );
  }

  getWeatherIcon(id): string {
    if (id >= 200 && id <= 232)
      return WeatherService.ICON_URL + "art_storm.png";
    else if (id >= 501 && id <= 511)
      return WeatherService.ICON_URL + "art_rain.png";
    else if (id === 500 || (id >= 520 && id <= 531))
      return WeatherService.ICON_URL + "art_light_rain.png";
    else if (id >= 600 && id <= 622)
      return WeatherService.ICON_URL + "art_snow.png";
    else if (id >= 801 && id <= 804)
      return WeatherService.ICON_URL + "art_clouds.png";
    else if (id === 741 || id === 761)
      return WeatherService.ICON_URL + "art_fog.png";
    else
      return WeatherService.ICON_URL + "art_clear.png";
  }

}
