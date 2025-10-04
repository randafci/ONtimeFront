import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TabConfig {
  maxTabs: number;
  defaultTab?: number;
  paramName?: string;
  encryptParams?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TabPersistenceService {
  private encryptionKey = 'OnTimeApp2024'; 
  private currentTabSubject = new BehaviorSubject<number>(0);
  public currentTab$ = this.currentTabSubject.asObservable();

  constructor(private router: Router) {}

  initializeTabFromUrl(route: ActivatedRoute, config: TabConfig): number {
    const paramName = config.paramName || 'tab';
    const tabParam = route.snapshot.queryParams[paramName];
    
    if (tabParam !== undefined && tabParam !== null) {
      let tabIndex: number;
      
      if (config.encryptParams) {
        try {
          const decrypted = this.decrypt(tabParam);
          tabIndex = parseInt(decrypted, 10);
        } catch (error) {
          console.warn('Failed to decrypt tab parameter, using default');
          tabIndex = config.defaultTab || 0;
        }
      } else {
        tabIndex = parseInt(tabParam, 10);
      }
      
      if (tabIndex >= 0 && tabIndex < config.maxTabs) {
        this.currentTabSubject.next(tabIndex);
        return tabIndex;
      }
    }
    
    const defaultTab = config.defaultTab || 0;
    this.currentTabSubject.next(defaultTab);
    return defaultTab;
  }


  changeTab(tabIndex: number, route: ActivatedRoute, config: TabConfig): void {
    if (tabIndex < 0 || tabIndex >= config.maxTabs) {
      console.warn(`Tab index ${tabIndex} is out of range (0-${config.maxTabs - 1})`);
      return;
    }

    this.currentTabSubject.next(tabIndex);
    this.updateUrlWithTab(tabIndex, route, config);
  }


  getCurrentTab(): number {
    return this.currentTabSubject.value;
  }

 
  private updateUrlWithTab(tabIndex: number, route: ActivatedRoute, config: TabConfig): void {
    const paramName = config.paramName || 'tab';
    let paramValue: string;
    
    if (config.encryptParams) {
      paramValue = this.encrypt(tabIndex.toString());
    } else {
      paramValue = tabIndex.toString();
    }

    this.router.navigate([], {
      relativeTo: route,
      queryParams: { [paramName]: paramValue },
      queryParamsHandling: 'merge'
    });
  }


  private encrypt(text: string): string {
    try {
   
      let encrypted = '';
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
        encrypted += String.fromCharCode(charCode);
      }
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      return text;
    }
  }

  
  private decrypt(encryptedText: string): string {
    try {
      const decoded = atob(encryptedText);
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
        decrypted += String.fromCharCode(charCode);
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt tab parameter');
    }
  }


  resetToDefault(route: ActivatedRoute, config: TabConfig): void {
    const defaultTab = config.defaultTab || 0;
    this.changeTab(defaultTab, route, config);
  }


  clearTabFromUrl(route: ActivatedRoute, config: TabConfig): void {
    const paramName = config.paramName || 'tab';
    this.router.navigate([], {
      relativeTo: route,
      queryParams: { [paramName]: null },
      queryParamsHandling: 'merge'
    });
  }
}
