import { OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TabPersistenceService, TabConfig } from '../services/tab-persistence.service';

export interface TabPersistenceMixin {
  activeTabIndex: number;
  tabConfig: TabConfig;
  onTabChange(tabIndex: number): void;
}

export function createTabPersistenceMixin<T extends new (...args: any[]) => any>(Base: T) {
  return class extends Base implements OnInit, OnDestroy {
    activeTabIndex = 0;
    tabConfig!: TabConfig;
    private destroy$ = new Subject<void>();
    protected tabPersistenceService!: TabPersistenceService;
    protected route!: ActivatedRoute;

    constructor(...args: any[]) {
      super(...args);
    }

    ngOnInit(): void {
      if (super.ngOnInit) {
        super.ngOnInit();
      }
      
      // Initialize tab from URL
      this.activeTabIndex = this.tabPersistenceService.initializeTabFromUrl(this.route, this.tabConfig);
      
      // Subscribe to tab changes
      this.tabPersistenceService.currentTab$
        .pipe(takeUntil(this.destroy$))
        .subscribe(tabIndex => {
          this.activeTabIndex = tabIndex;
        });
    }

    onTabChange(tabIndex: number): void {
      this.tabPersistenceService.changeTab(tabIndex, this.route, this.tabConfig);
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
      
      if (super.ngOnDestroy) {
        super.ngOnDestroy();
      }
    }
  };
}
