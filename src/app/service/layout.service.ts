// src/app/core/services/layout.service.ts
import { Injectable, effect, signal, computed } from '@angular/core';
import { firstValueFrom, Subject } from 'rxjs';
import { SettingsService } from './layout.SettingsService';

export interface LayoutConfig {
  preset?: string;
  primary?: string;
  surface?: string | undefined | null;
  darkTheme?: boolean;
  menuMode?: string;
  direction?: 'ltr' | 'rtl';
}

interface LayoutState {
  staticMenuDesktopInactive?: boolean;
  overlayMenuActive?: boolean;
  configSidebarVisible?: boolean;
  staticMenuMobileActive?: boolean;
  menuHoverActive?: boolean;
}

interface MenuChangeEvent {
  key: string;
  routeEvent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private _config: LayoutConfig = {
    preset: 'Aura',
    primary: 'emerald',
    surface: null,
    darkTheme: false,
    menuMode: 'static',
    direction: 'ltr'
  };

  private _state: LayoutState = {
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false
  };

  layoutConfig = signal<LayoutConfig>(this._config);
  layoutState = signal<LayoutState>(this._state);

  private configUpdate = new Subject<LayoutConfig>();
  private overlayOpen = new Subject<any>();
  private menuSource = new Subject<MenuChangeEvent>();
  private resetSource = new Subject();

  menuSource$ = this.menuSource.asObservable();
  resetSource$ = this.resetSource.asObservable();
  configUpdate$ = this.configUpdate.asObservable();
  overlayOpen$ = this.overlayOpen.asObservable();

  theme = computed(() => (this.layoutConfig().darkTheme ? 'dark' : 'light'));
  isSidebarActive = computed(
    () => this.layoutState().overlayMenuActive || this.layoutState().staticMenuMobileActive
  );
  isDarkTheme = computed(() => this.layoutConfig().darkTheme);
  getPrimary = computed(() => this.layoutConfig().primary);
  getSurface = computed(() => this.layoutConfig().surface);
  isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');
  transitionComplete = signal<boolean>(false);
  isRTL = computed(() => this.layoutConfig().direction === 'rtl');

  private initialized = false;

  constructor(private settingsService: SettingsService) {
    // React to local config changes
    effect(() => {
      const config = this.layoutConfig();
      if (config) {
        this.onConfigUpdate();
      }
    });

    effect(() => {
      const config = this.layoutConfig();
      if (!this.initialized || !config) {
        this.initialized = true;
        return;
      }
      this.handleDarkModeTransition(config);
    });
  }

  // Normalize API response
  private normalizeSettings(settings: any): { config: LayoutConfig; state: LayoutState } {
    return {
      config: {
        preset: settings.preset,
        primary: settings.primary,
        surface: settings.surface,
        darkTheme: settings.darkTheme === true || settings.darkTheme === 'true',
        menuMode: settings.menuMode,
        direction: settings.direction?.toLowerCase() === 'rtl' ? 'rtl' : 'ltr'
      },
      state: {
        staticMenuDesktopInactive:
          settings.staticMenuDesktopInactive === true || settings.staticMenuDesktopInactive === 'true',
        overlayMenuActive:
          settings.overlayMenuActive === true || settings.overlayMenuActive === 'true',
        configSidebarVisible:
          settings.configSidebarVisible === true || settings.configSidebarVisible === 'true',
        staticMenuMobileActive:
          settings.staticMenuMobileActive === true || settings.staticMenuMobileActive === 'true',
        menuHoverActive:
          settings.menuHoverActive === true || settings.menuHoverActive === 'true'
      }
    };
  }

  async initFromApi(type: number) {
    try {
      const response = await firstValueFrom(this.settingsService.getOrgLayoutSettings(type));
      const normalized = this.normalizeSettings(response.data);

      this.layoutConfig.set({ ...this.layoutConfig(), ...normalized.config });
      this.layoutState.set({ ...this.layoutState(), ...normalized.state });

      this.onConfigUpdate();
      this.handleDarkModeTransition(this.layoutConfig());
      
    } catch (err) {
      console.error('Failed to load org settings:', err);
    }
  }

  private handleDarkModeTransition(config: LayoutConfig): void {
    if ((document as any).startViewTransition) {
      this.startViewTransition(config);
    } else {
      this.toggleDarkMode(config);
      this.onTransitionEnd();
    }
  }

  private startViewTransition(config: LayoutConfig): void {
    const transition = (document as any).startViewTransition(() => {
      this.toggleDarkMode(config);
    });

    transition.ready
      .then(() => this.onTransitionEnd())
      .catch(() => {});
  }

  toggleDarkMode(config?: LayoutConfig): void {
    const _config = config || this.layoutConfig();
    if (_config.darkTheme) {
      document.documentElement.classList.add('app-dark');
    } else {
      document.documentElement.classList.remove('app-dark');
    }
  }

  toggleDirection() {
    const newDir = this.layoutConfig().direction === 'rtl' ? 'ltr' : 'rtl';
    this.layoutConfig.update((prev) => ({ ...prev, direction: newDir }));
  }

  private onTransitionEnd() {
    this.transitionComplete.set(true);
    setTimeout(() => this.transitionComplete.set(false));
  }

  onMenuToggle() {
    if (this.isOverlay()) {
      this.layoutState.update((prev) => ({
        ...prev,
        overlayMenuActive: !this.layoutState().overlayMenuActive
      }));

      if (this.layoutState().overlayMenuActive) {
        this.overlayOpen.next(null);
      }
    }

    if (this.isDesktop()) {
      this.layoutState.update((prev) => ({
        ...prev,
        staticMenuDesktopInactive: !this.layoutState().staticMenuDesktopInactive
      }));
    } else {
      this.layoutState.update((prev) => ({
        ...prev,
        staticMenuMobileActive: !this.layoutState().staticMenuMobileActive
      }));

      if (this.layoutState().staticMenuMobileActive) {
        this.overlayOpen.next(null);
      }
    }
  }

  isDesktop() {
    return window.innerWidth > 991;
  }

  isMobile() {
    return !this.isDesktop();
  }

  onConfigUpdate() {
    this._config = { ...this.layoutConfig() };
    this.configUpdate.next(this.layoutConfig());
    if (this._config.direction) {
      document.documentElement.setAttribute('dir', this._config.direction);
    }
  }

  onMenuStateChange(event: MenuChangeEvent) {
    this.menuSource.next(event);
  }

  reset() {
    this.resetSource.next(true);
  }
  setDarkTheme(enabled: boolean) {
  this.layoutConfig.update((cfg) => ({ ...cfg, darkTheme: enabled }));
  this.toggleDarkMode(); // immediately apply/remove the class on <html>
}
applyDirection(direction: 'ltr'|'rtl') {
  this.layoutConfig.update((cfg) => ({ ...cfg, direction }));
  document.documentElement.setAttribute('dir', direction);
}

}
