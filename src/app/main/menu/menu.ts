import { MegaMenuItem,MenuItem } from '../../interfaces/MenuItem';
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
      label: 'OnTime',   // fake root
      items: [
        {
          label: 'Home',
          items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
          ]
        },
        {
          label: 'Superadmin',
          items: [
            { label: 'Organization', icon: 'pi pi-fw pi-building', routerLink: ['/organizations/list'] }
          ]
        },
        {
          label: 'Organization',
          items: [
            { label: 'Company', icon: 'pi pi-fw pi-building', routerLink: ['/companies/list'] },
            { label: 'Department', icon: 'pi pi-fw pi-sitemap', routerLink: ['/departments/list'] },
            { label: 'Section', icon: 'pi pi-fw pi-sitemap', routerLink: ['/sections/list'] }
          ]
        },
        {
          label: 'Users',
          items: [
            { label: 'User', icon: 'pi pi-fw pi-sitemap', routerLink: ['/users/list'] },
            { label: 'Role', icon: 'pi pi-fw pi-key', routerLink: ['/roles'] },
            { label: 'Employee', icon: 'pi pi-fw pi-users', routerLink: ['/employees'] }
          ]
        }
      ]
    }
  ];
}

}
