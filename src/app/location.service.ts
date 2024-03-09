import { Injectable, signal } from '@angular/core';

export const LOCATIONS : string = "locations";

@Injectable()
export class LocationService {

  private locationsSignal = signal<string[]>([]);
  readonly locations = this.locationsSignal.asReadonly();

  constructor() {
    let locString = localStorage.getItem(LOCATIONS);
    if (locString) {
      for (let loc of JSON.parse(locString)) {
        this.locationsSignal.update(locations => [...locations, loc]);
      }
    }
  }

  addLocation(zipcode : string) {
    this.locationsSignal.update(locations => [...locations, zipcode]);
    localStorage.setItem(LOCATIONS, JSON.stringify(this.locations()));
  }

  removeLocation(zipcode : string) {
    let index = this.locations().indexOf(zipcode);
    if (index !== -1){
      this.locationsSignal.update(locations => {
        let cleanedLocations = [...locations];
        cleanedLocations.splice(index, 1);
        return cleanedLocations;
      });
      localStorage.setItem(LOCATIONS, JSON.stringify(this.locations()));
    }
  }
}
