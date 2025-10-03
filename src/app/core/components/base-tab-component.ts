import { OnInit, OnDestroy, Input, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TabPersistenceService, TabConfig } from '../services/tab-persistence.service';

@Component({
  template: ''
})
export abstract class BaseTabComponent implements OnInit, OnDestroy {
  @Input() activeTabIndex = 0;
  @Input() tabConfig!: TabConfig;
  
  protected destroy$ = new Subject<void>();

  constructor(
    protected tabPersistenceService: TabPersistenceService,
    protected route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeTabPersistence();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabChange(tabIndex: number): void {
    this.tabPersistenceService.changeTab(tabIndex, this.route, this.tabConfig);
  }

  private initializeTabPersistence(): void {
    if (!this.tabConfig) {
      console.warn('TabConfig is required for tab persistence');
      return;
    }

  
    this.activeTabIndex = this.tabPersistenceService.initializeTabFromUrl(this.route, this.tabConfig);
    
 
    this.tabPersistenceService.currentTab$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tabIndex => {
        this.activeTabIndex = tabIndex;
      });
  }
}
