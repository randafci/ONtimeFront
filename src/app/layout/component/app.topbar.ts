import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { TooltipModule } from 'primeng/tooltip';
import { TranslationService } from '../../pages/translation-manager/translation-manager/translation.service';
import { Subscription } from 'rxjs';
import { AppSettingsPanel } from "@/main/settings-panel.component";


@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, TooltipModule, AppSettingsPanel],

    template: `
    <div class="layout-topbar">

        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <!-- logo svg -->
                <span>On Time</span>
            </a>
        </div>

        <div class="layout-topbar-actions">

        <button type="button" class="layout-topbar-action"
                        (click)="switchLanguage()"
                        [pTooltip]="(currentLang === 'ar' ? 'Switch to English' : 'Switch to Arabic')"
                        tooltipPosition="bottom">
                    <i class="pi pi-globe p-text-secondary" style="font-size: 1.5rem"></i>
                </button>
            <div class="layout-config-menu">
              <!--   <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button> -->

               <!--   <div class="relative">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>  -->
            </div>

            <div class="relative">
  <button
      class="layout-topbar-action layout-topbar-action-highlight"
      pStyleClass="@next"
      enterFromClass="hidden"
      enterActiveClass="animate-scalein"
      leaveToClass="hidden"
      leaveActiveClass="animate-fadeout"
      [hideOnOutsideClick]="true"
  >
    <i class="pi pi-cog"></i>
  </button>
    <app-settings-panel/>
</div>

            <button class="layout-topbar-menu-button layout-topbar-action"
                pStyleClass="@next"
                enterFromClass="hidden"
                enterActiveClass="animate-scalein"
                leaveToClass="hidden"
                leaveActiveClass="animate-fadeout"
                [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                    <button type="button" class="layout-topbar-action"  (click)="LogOut()">
                        <i class="pi pi-sign-out"></i>

                        <span>logout</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar implements OnInit, OnDestroy {
    items!: MenuItem[];
    currentLang: string = 'ar';
    private langSubscription!: Subscription;
    constructor(public layoutService: LayoutService, private router: Router, private translationService: TranslationService) { }

    ngOnInit(): void {
        // Subscribe to the current language from the service
        this.langSubscription = this.translationService.currentLang$.subscribe(lang => {
            this.currentLang = lang;
        });
    }

    switchLanguage(): void {
        this.translationService.toggleLanguage();
    }


    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    switchDir() {
        const newDir = this.layoutService.layoutConfig().direction === 'rtl' ? 'ltr' : 'rtl';
        this.layoutService.layoutConfig.update((state) => ({ ...state, direction: newDir }));
    }

    LogOut() {
        // redirect to login
        this.router.navigate(['/login']);

    }


    ngOnDestroy(): void {
        // Unsubscribe to prevent memory leaks
        if (this.langSubscription) {
            this.langSubscription.unsubscribe();
        }
    }

}
