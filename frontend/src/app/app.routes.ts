import { Routes, provideRouter, withHashLocation } from '@angular/router';

export const routes: Routes = [];

export const appConfig = {
  providers: [
    provideRouter(routes, withHashLocation())
  ]
};
