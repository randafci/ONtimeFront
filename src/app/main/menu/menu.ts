import { MegaMenuItem,MenuItem } from '@/interfaces/MenuItem';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItemComponent } from './menu-item/menu-item';

@Component({
  selector: 'app-menu1',
  standalone: true,  
  imports: [CommonModule, MenuItemComponent, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class MenuComponent {
 model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
             {
                label: 'Organization',
                items: [{ label: 'Organization', icon: 'pi pi-fw pi-home', routerLink: ['/organizations/list'] }]
            },
            {
                label: 'Company',
                items: [{ label: 'Company', icon: 'pi pi-fw pi-building', routerLink: ['/companies/list'] }]
            },
            {
                label: 'Department',
                items: [{ label: 'Department', icon: 'pi pi-fw pi-sitemap', routerLink: ['/departments/list'] }]
            }

            

        ];
    }
}
