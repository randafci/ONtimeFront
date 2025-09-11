import { MenuItem } from '../../interfaces/MenuItem';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItemComponent } from './menu-item/menu-item';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-menu1',
  standalone: true,  
  imports: [CommonModule, MenuItemComponent, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class MenuComponent implements OnInit {
 model: MenuItem[] = [];

 constructor(private authService: AuthService) {}

 private isSuperAdmin(): boolean {
   const claims = this.authService.getClaims();
   return claims?.IsSuperAdmin === "true" || claims?.IsSuperAdmin === true;
 }

 ngOnInit() {
   this.buildMenu();
 }

 private buildMenu() {
   const isSuperAdmin = this.isSuperAdmin();
   
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
         ...(isSuperAdmin ? [{
           label: 'Superadmin',
           items: [
             { label: 'Organization', icon: 'pi pi-fw pi-building', routerLink: ['/organizations/list'] }
           ]
         }] : []),
         {
           label: 'Organization',
           items: [
             { label: 'Company', icon: 'pi pi-fw pi-building', routerLink: ['/companies/list'] },
             { label: 'Designation', icon: 'pi pi-fw pi-briefcase', routerLink: ['/designations/list'] },
             { label: 'Department', icon: 'pi pi-fw pi-sitemap', routerLink: ['/departments/list'] },
             { label: 'Section', icon: 'pi pi-fw pi-sitemap', routerLink: ['/sections/list'] },
             { label: 'Event', icon: 'pi pi-fw pi-sitemap', routerLink: ['/events/list'] }
           ]
         },
         {
           label: 'Users',
           items: [
             { label: 'User', icon: 'pi pi-fw pi-sitemap', routerLink: ['/users/list'] },
             ...(isSuperAdmin ? [{ label: 'Role', icon: 'pi pi-fw pi-key', routerLink: ['/roles'] }] : []),
             { label: 'Employee', icon: 'pi pi-fw pi-users', routerLink: ['/employees'] }
           ]
         },
         {
          label: 'Settings',
          items: [
            { label: 'English Translation', icon: 'pi pi-fw pi-globe', routerLink: ['/translations/en'] },
            { label: 'Arabic Translation', icon: 'pi pi-fw pi-globe', routerLink: ['/translations/ar'] }
          ]
        }
       ]
     }
   ];
 }

}
