import { AppConfigService } from '@/pages/service/app-config.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
export function initializeApp(appConfig: AppConfigService) {
  return () => appConfig.loadConfig();
}
@Component({
    selector: 'app-root',
    standalone: true,
     imports: [RouterModule,CommonModule, HttpClientModule],
  providers: [
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfigService],
      multi: true
    }
  ],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {}
