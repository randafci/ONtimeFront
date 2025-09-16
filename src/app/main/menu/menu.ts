import { MenuItem } from '../../interfaces/MenuItem';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItemComponent } from './menu-item/menu-item';
import { AuthService } from '../../auth/auth.service';
import { TranslationService } from '../../pages/translation-manager/translation-manager/translation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu1',
  standalone: true,
  imports: [CommonModule, MenuItemComponent, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class MenuComponent implements OnInit {
  model: MenuItem[] = [];
  private translations: any = {};
    private translationSubscription!: Subscription;

  constructor(private authService: AuthService, private translationService: TranslationService) { }

  private isSuperAdmin(): boolean {
    const claims = this.authService.getClaims();
    return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
  }

  ngOnInit() {
        this.translationSubscription = this.translationService.translations$.subscribe(translations => {
            this.translations = translations;
            this.buildMenu(); 
        });
  }


    private t(key: string): string {
        if (!this.translations || !key) {
            return key;
        }
        return key.split('.').reduce((o, i) => (o ? o[i] : null), this.translations) || key;
    }

 private buildMenu() {
   const isSuperAdmin = this.isSuperAdmin();
   
   this.model = [
            {
                label: this.t('menu.mainLabel'),
                items: [
                    {
                        label: this.t('menu.home.groupLabel'),
                        items: [
                            { label: this.t('menu.home.dashboard'), icon: 'pi pi-fw pi-home', routerLink: ['/'] }
                        ]
                    },
                    ...(isSuperAdmin ? [{
                        label: this.t('menu.superadmin.groupLabel'),
                        items: [
                            { label: this.t('menu.superadmin.organization'), icon: 'pi pi-fw pi-building', routerLink: ['/organizations/list'] }
                        ]
                    }] : []),
                    {
                        label: this.t('menu.organization.groupLabel'),
                        items: [
                            { label: this.t('menu.organization.company'), icon: 'pi pi-fw pi-building', routerLink: ['/companies/list'] },
                            { label: this.t('menu.organization.designation'), icon: 'pi pi-fw pi-briefcase', routerLink: ['/designations/list'] },
                            { label: this.t('menu.organization.department'), icon: 'pi pi-fw pi-sitemap', routerLink: ['/departments/list'] },
                            { label: this.t('menu.organization.section'), icon: 'pi pi-fw pi-sitemap', routerLink: ['/sections/list'] },
                            { label: this.t('menu.organization.event'), icon: 'pi pi-fw pi-sitemap', routerLink: ['/events/list'] }
                        ]
                    },
                    {
                        label: this.t('menu.users.groupLabel'),
                        items: [
                            { label: this.t('menu.users.user'), icon: 'pi pi-fw pi-sitemap', routerLink: ['/users/list'] },
                            { label: this.t('menu.users.role'), icon: 'pi pi-fw pi-key', routerLink: ['/roles'] },
                            { label: this.t('menu.users.employee'), icon: 'pi pi-fw pi-users', routerLink: ['/employees'] }
                        ]
                    },
                    {
                        label: this.t('menu.settings.groupLabel'),
                        items: [
                            { label: this.t('menu.settings.english'), icon: 'pi pi-fw pi-globe', routerLink: ['/translations/en'] },
                            { label: this.t('menu.settings.arabic'), icon: 'pi pi-fw pi-globe', routerLink: ['/translations/ar'] }
                        ]
                    },
                    {
                        label: this.t('menu.device.groupLabel'),
                        items: [
                            { label: this.t('menu.device.location'), icon: 'pi pi-fw pi-map-marker', routerLink: ['/locations/list'] },
                            { label: this.t('menu.device.device'), icon: 'pi pi-fw pi-desktop', routerLink: ['/devices'] }
                        ]
                    }
                ]
            }
        ];
 }

}
