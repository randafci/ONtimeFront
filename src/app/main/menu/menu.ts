import { MenuItem } from '../../interfaces/MenuItem';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class MenuComponent implements OnInit, OnDestroy {
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

  ngOnDestroy() {
    if (this.translationSubscription) {
      this.translationSubscription.unsubscribe();
    }
  }

  private t(key: string): string {
    if (!this.translations || !key) {
      return key;
    }
    return key.split('.').reduce((o, i) => (o ? o[i] : null), this.translations) || key;
  }

  private hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  private hasAnyPermission(permissions: string[]): boolean {
    return this.authService.isAuthorized(permissions, true);
  }

  private buildMenu() {
    const isSuperAdmin = this.isSuperAdmin();
    
    this.model = [
      {
        label: this.t('menu.mainLabel'),
        items: [
          // Home - Always visible
          {
            label: this.t('menu.home.groupLabel'),
            items: [
              { label: this.t('menu.home.dashboard'), icon: 'pi pi-fw pi-home', routerLink: ['/'] }
            ]
          },
          
          // Super Admin Section - Only for super admins
          ...(isSuperAdmin ? [{
            label: this.t('menu.superadmin.groupLabel'),
            items: [
              { label: this.t('menu.superadmin.organization'), icon: 'pi pi-fw pi-building', routerLink: ['/organizations/list'] }
            ]
          }] : []),
          
          // Organization Section
          ...(this.getOrganizationSection(isSuperAdmin)),
          
          // Users Section
          ...(this.getUsersSection(isSuperAdmin)),
          
          // Settings Section
          ...(this.getSettingsSection(isSuperAdmin)),
          
          // Device Section
          ...(this.getDeviceSection(isSuperAdmin)),
          
          // HR Section
          ...(this.getHrSection(isSuperAdmin)),
          
          // Attendance Section
          ...(this.getAttendanceSection(isSuperAdmin)),
          
          // Employee Section
          ...(this.getEmployeeSection(isSuperAdmin)),
          
          // Workflow Section
          ...(this.getWorkflowSection(isSuperAdmin))
        ].filter(section => section !== null)
      }
    ];
  }

  // Section generators - each returns array of sections or empty array
  private getOrganizationSection(isSuperAdmin: boolean): any[] {
    const items = [
      { permission: 'Permissions.Companies.Page', label: 'menu.organization.company', icon: 'pi pi-fw pi-building', route: '/companies/list' },
      { permission: 'Permissions.Designations.Page', label: 'menu.organization.designation', icon: 'pi pi-fw pi-briefcase', route: '/designations/list' },
      { permission: 'Permissions.Departments.Page', label: 'menu.organization.department', icon: 'pi pi-fw pi-sitemap', route: '/departments/list' },
      { permission: 'Permissions.Sections.Page', label: 'menu.organization.section', icon: 'pi pi-fw pi-sitemap', route: '/sections/list' },
      { permission: 'Permissions.Events.Page', label: 'menu.organization.event', icon: 'pi pi-fw pi-sitemap', route: '/events/list' },
      { permission: 'Permissions.Families.Page', label: 'menu.organization.family', icon: 'pi pi-fw pi-users', route: '/families' },
      { permission: 'Permissions.Grades.Page', label: 'menu.organization.grade', icon: 'pi pi-fw pi-star', route: '/grades' },
      { permission: 'Permissions.CostCenters.Page', label: 'menu.organization.costCenter', icon: 'pi pi-fw pi-dollar', route: '/cost-centers/list' },
      { permission: 'Permissions.ShiftTypes.Page', label: 'menu.organization.shiftType', icon: 'pi pi-fw pi-clone', route: '/shift-types/list' },
      { permission: 'Permissions.Teams.Page', label: 'menu.teams.teams', icon: 'pi pi-fw pi-users', route: '/teams' }
    ];

    const visibleItems = items.filter(item => 
      isSuperAdmin || this.hasPermission(item.permission)
    );

    if (visibleItems.length === 0) return [];

    return [{
      label: this.t('menu.organization.groupLabel'),
      items: visibleItems.map(item => ({
        label: this.t(item.label),
        icon: item.icon,
        routerLink: [item.route]
      }))
    }];
  }

  private getUsersSection(isSuperAdmin: boolean): any[] {
    const items = [
      { permission: 'Permissions.Users.Page', label: 'menu.users.user', icon: 'pi pi-fw pi-sitemap', route: '/users/list' },
      { permission: 'Permissions.Roles.Page', label: 'menu.users.role', icon: 'pi pi-fw pi-key', route: '/roles/list' }
    ];

    const visibleItems = items.filter(item => 
      isSuperAdmin || this.hasPermission(item.permission)
    );

    if (visibleItems.length === 0) return [];

    return [{
      label: this.t('menu.users.groupLabel'),
      items: visibleItems.map(item => ({
        label: this.t(item.label),
        icon: item.icon,
        routerLink: [item.route]
      }))
    }];
  }

  private getSettingsSection(isSuperAdmin: boolean): any[] {
    const items = [
      { permission: 'Permissions.Countries.Page', label: 'menu.settings.countries', icon: 'pi pi-fw pi-globe', route: '/countries/list' },
      { permission: 'Permissions.Translations.Page', label: 'menu.settings.english', icon: 'pi pi-fw pi-globe', route: '/translations/en' },
      { permission: 'Permissions.Translations.Page', label: 'menu.settings.arabic', icon: 'pi pi-fw pi-globe', route: '/translations/ar' }
    ];

    const visibleItems = items.filter(item => 
      isSuperAdmin || this.hasPermission(item.permission)
    );

    if (visibleItems.length === 0) return [];

    return [{
      label: this.t('menu.settings.groupLabel'),
      items: visibleItems.map(item => ({
        label: this.t(item.label),
        icon: item.icon,
        routerLink: [item.route]
      }))
    }];
  }

  private getDeviceSection(isSuperAdmin: boolean): any[] {
    const items = [
      { permission: 'Permissions.Locations.Page', label: 'menu.device.location', icon: 'pi pi-fw pi-map-marker', route: '/locations/list' },
      { permission: 'Permissions.Devices.Page', label: 'menu.device.device', icon: 'pi pi-fw pi-desktop', route: '/devices' }
    ];

    const visibleItems = items.filter(item => 
      isSuperAdmin || this.hasPermission(item.permission)
    );

    if (visibleItems.length === 0) return [];

    return [{
      label: this.t('menu.device.groupLabel'),
      items: visibleItems.map(item => ({
        label: this.t(item.label),
        icon: item.icon,
        routerLink: [item.route]
      }))
    }];
  }

  private getHrSection(isSuperAdmin: boolean): any[] {
    const items = [
      { permission: 'Permissions.Holidays.Page', label: 'menu.hr.holidays', icon: 'pi pi-fw pi-calendar', route: '/holidays/list' },
      { permission: 'Permissions.HolidayTypes.Page', label: 'menu.hr.holidayTypes', icon: 'pi pi-fw pi-tags', route: '/holiday-types/list' },
      { permission: 'Permissions.LeaveTypes.Page', label: 'menu.hr.leaveTypes', icon: 'pi pi-fw pi-calendar-plus', route: '/leave-types/list' },
      { permission: 'Permissions.RamadanPeriods.Page', label: 'menu.hr.ramadanPeriods', icon: 'pi pi-fw pi-moon', route: '/ramadan-periods/list' },
      { permission: 'Permissions.OvertimeRequests.Page', label: 'menu.hr.overTime', icon: 'pi pi-fw pi-moon', route: '/overTime/list' }
    ];

    const visibleItems = items.filter(item => 
      isSuperAdmin || this.hasPermission(item.permission)
    );

    if (visibleItems.length === 0) return [];

    return [{
      label: this.t('menu.hr.groupLabel'),
      items: visibleItems.map(item => ({
        label: this.t(item.label),
        icon: item.icon,
        routerLink: [item.route]
      }))
    }];
  }

  private getAttendanceSection(isSuperAdmin: boolean): any[] {
    const items = [
      { permission: 'Permissions.Shifts.Page', label: 'menu.organization.shift', icon: 'pi pi-fw pi-clock', route: '/shifts/list' },
      { permission: 'Permissions.Timetables.Page', label: 'menu.timetable.timetable', icon: 'pi pi-fw pi-clock', route: '/timetables' },
      { permission: 'Permissions.RegularizationRequests.Page', label: 'menu.attendance.regularization', icon: 'pi pi-fw pi-clock', route: '/attendance' }
    ];

    const visibleItems = items.filter(item => 
      isSuperAdmin || this.hasPermission(item.permission)
    );

    if (visibleItems.length === 0) return [];

    return [{
      label: this.t('menu.attendance.groupLabel'),
      items: visibleItems.map(item => ({
        label: this.t(item.label),
        icon: item.icon,
        routerLink: [item.route]
      }))
    }];
  }

  private getEmployeeSection(isSuperAdmin: boolean): any[] {
    const items = [
      { permission: 'Permissions.Employees.Page', label: 'menu.users.employee', icon: 'pi pi-fw pi-users', route: '/employees' },
      { permission: 'Permissions.EmployeeDevices.Page', label: 'menu.employeeDevicesAssignment.employeeDevicesAssignment', icon: 'pi pi-fw pi-map-marker', route: '/employeeDevicesAssignment' },
      { permission: 'Permissions.ReportingManager.Page', label: 'menu.employee.reportingManager', icon: 'pi pi-fw pi-sitemap', route: '/employees/reportingmanager/add' }
    ];

    const visibleItems = items.filter(item => 
      isSuperAdmin || this.hasPermission(item.permission)
    );

    if (visibleItems.length === 0) return [];

    return [{
      label: this.t('menu.employee.groupLabel'),
      items: visibleItems.map(item => ({
        label: this.t(item.label),
        icon: item.icon,
        routerLink: [item.route]
      }))
    }];
  }

  private getWorkflowSection(isSuperAdmin: boolean): any[] {
    const items = [
      { permission: 'Permissions.Workflow.Page', label: 'menu.workflow.workflow', icon: 'pi pi-fw pi-users', route: '/workflow' }
    ];

    const visibleItems = items.filter(item => 
      isSuperAdmin || this.hasPermission(item.permission)
    );

    if (visibleItems.length === 0) return [];

    return [{
      label: this.t('menu.workflow.groupLabel'),
      items: visibleItems.map(item => ({
        label: this.t(item.label),
        icon: item.icon,
        routerLink: [item.route]
      }))
    }];
  }
}