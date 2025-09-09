import { provideHttpClient, withFetch } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { TranslationService } from './app/pages/translation-manager/translation-manager/translation.service';
import { Observable } from 'rxjs';


export function initializeTranslations(translationService: TranslationService): () => Observable<any> {
  
  const initialLang = localStorage.getItem('user-lang') || 'en';
  return () => translationService.loadTranslations(initialLang);
}


export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch()),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslations,
      deps: [TranslationService], 
      multi: true 
    }
    ]
};
