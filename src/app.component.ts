import { AppConfigService } from './app/pages/service/app-config.service';
import { LayoutService } from './app/service/layout.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';

export function initializeApp(appConfig: AppConfigService) {
 // return () => appConfig.loadConfig();
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, HttpClientModule],
  providers: [
 
  ],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  constructor(private layoutService: LayoutService) {}
   ngOnInit() {
    // Load org layout settings (type = 2 example)
    this.layoutService.initFromApi(2);
  }
}
