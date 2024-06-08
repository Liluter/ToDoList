import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics, ScreenTrackingService } from '@angular/fire/analytics';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"todo-list-lowgular","appId":"1:233511898140:web:d3655248dff6cf6c7b23d9","storageBucket":"todo-list-lowgular.appspot.com","apiKey":"AIzaSyApSofMDhSd_yU1DbuPVVZy3p4XCNvVY1U","authDomain":"todo-list-lowgular.firebaseapp.com","messagingSenderId":"233511898140"})), provideAnalytics(() => getAnalytics()), ScreenTrackingService]
};
