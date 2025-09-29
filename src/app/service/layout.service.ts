// src/app/core/services/layout.service.ts
import { Injectable, effect, signal, computed } from '@angular/core';
import { firstValueFrom, Subject } from 'rxjs';
import { SettingsService } from './layout.SettingsService';
import { $t, updatePreset, updateSurfacePalette } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import Nora from '@primeuix/themes/nora';

const presets = {
  Aura,
  Lara,
  Nora
} as const;

// Primary color palettes
export const primaryPalettes = {
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22'
  },
  lime: {
    50: '#f7fee7',
    100: '#ecfccb',
    200: '#d9f99d',
    300: '#bef264',
    400: '#a3e635',
    500: '#84cc16',
    600: '#65a30d',
    700: '#4d7c0f',
    800: '#3f6212',
    900: '#365314',
    950: '#1a2e05'
  },
  // Add more primary colors to match your settings panel
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16'
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  }
} as const;

// Surface color palettes
export const surfacePalettes = {
  slate: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  gray: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712'
  },
  zinc: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b'
  },
  viva: {
    0: '#ffffff',
    50: '#f3f3f3',
    100: '#e7e7e8',
    200: '#cfd0d0',
    300: '#b7b8b9',
    400: '#9fa1a1',
    500: '#87898a',
    600: '#6e7173',
    700: '#565a5b',
    800: '#3e4244',
    900: '#262b2c',
    950: '#0e1315'
  }
} as const;

type KeyOfType<T> = keyof T extends infer U ? U : never;

export interface LayoutConfig {
  preset?: string;
  primary?: string;
  surface?: string | undefined | null;
  darkTheme?: boolean;
  menuMode?: string;
  direction?: 'ltr' | 'rtl';
  header?: boolean;
  navigation?: 'side' | 'top';
  language?: 'en'|'ar';
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
    direction: 'ltr',
    header: true,
    navigation: 'side',
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
  isHeaderVisible = computed(() => this.layoutConfig().header ?? true);
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
    const toBoolean = (value: any): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value.toLowerCase() === 'true';
      return false;
    };

    return {
      config: {
        preset: settings.preset || 'Aura',
        primary: settings.primary || 'emerald',
        surface: settings.surface !== null && settings.surface !== undefined ? settings.surface : null,
        darkTheme: toBoolean(settings.darkTheme),
        menuMode: settings.menuMode || 'static',
        direction: (settings.direction?.toLowerCase() === 'rtl' ? 'rtl' : 'ltr') as 'ltr' | 'rtl',
        header: toBoolean(settings.header ?? true),
        navigation: (settings.navigation === 'top' ? 'top' : 'side') as 'side' | 'top',
        language:settings.language

      },
      state: {
        staticMenuDesktopInactive: toBoolean(settings.staticMenuDesktopInactive),
        overlayMenuActive: toBoolean(settings.overlayMenuActive),
        configSidebarVisible: toBoolean(settings.configSidebarVisible),
        staticMenuMobileActive: toBoolean(settings.staticMenuMobileActive),
        menuHoverActive: toBoolean(settings.menuHoverActive),
      },
      

    };
  }

  async initFromApi(type: number) {
    try {
      const response = await firstValueFrom(this.settingsService.getOrgLayoutSettings(type));
      const normalized = this.normalizeSettings(response.data);
      // Use individual setter methods with proper default values
      this.setPreset(normalized.config.preset || 'Aura');
      this.setPrimaryColor(normalized.config.primary || 'emerald');
      this.setSurface(normalized.config.surface ?? null);
      this.setDarkTheme(normalized.config.darkTheme ?? false);
      this.setMenuMode(normalized.config.menuMode || 'static');
      this.setDirection(normalized.config.direction || 'ltr');
      this.setHeader(normalized.config.header ?? true);
      this.setNavigation(normalized.config.navigation || 'side');
      this.setLanguage(normalized.config.language || 'en');

//
      // Update layout state
      this.layoutState.set(normalized.state);

      // Apply basic layout configurations
      this.applyConfig();
      
    } catch (err) {
      console.error('Failed to load org settings:', err);
      // Fallback to default config
      this.applyConfig();
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
    this.applyHeaderVisibility(this._config.header ?? true);
  }

  onMenuStateChange(event: MenuChangeEvent) {
    this.menuSource.next(event);
  }

  reset() {
    this.resetSource.next(true);
  }

  setDarkTheme(enabled: boolean) {
    this.layoutConfig.update((cfg) => ({ ...cfg, darkTheme: enabled }));
    this.toggleDarkMode();
    this.onConfigUpdate();
  }

  applyDirection(direction: 'ltr'|'rtl') {
    this.layoutConfig.update((cfg) => ({ ...cfg, direction }));
    document.documentElement.setAttribute('dir', direction);
    this.onConfigUpdate();
  }

  setDirection(direction: 'ltr' | 'rtl') {
    this.layoutConfig.update((cfg) => ({ ...cfg, direction }));
    document.documentElement.setAttribute('dir', direction);
    this.onConfigUpdate();
  }

  setHeader(visible: boolean) {
    this.layoutConfig.update((cfg) => ({ ...cfg, header: visible }));
    this.onConfigUpdate();
  }

  setMenuMode(mode: string) {
    this.layoutConfig.update((cfg) => ({ ...cfg, menuMode: mode }));
    this.onConfigUpdate();
  }

  setNavigation(navigation: 'side' | 'top') {
    this.layoutConfig.update((cfg) => ({ ...cfg, navigation }));
    this.onConfigUpdate();
  }

  setPreset(preset: string) {
    this.layoutConfig.update((cfg) => ({ ...cfg, preset }));
    this.applyThemePreset();
    this.onConfigUpdate();
  }

   

  setPrimaryColor(primary: string) {
    this.layoutConfig.update((cfg) => ({ ...cfg, primary }));
    this.applyThemePreset(); // Re-apply with new primary
    this.onConfigUpdate();
    console.log("primary " , primary)
  }

  setSurface(surface: string | null) {
    this.layoutConfig.update((cfg) => ({ ...cfg, surface }));
    this.applyThemePreset(); // Re-apply with new surface
    this.onConfigUpdate();
  }

  // Apply the actual PrimeUI theme preset + overrides
  private applyThemePreset() {
    const config = this.layoutConfig();
    const presetName = config.preset || 'Aura';
    const preset = presets[presetName as KeyOfType<typeof presets>];
    
    if (preset) {
      // Get the custom preset extension with primary and surface overrides
      const presetExt = this.getPresetExt();
      
      // Apply the base preset with customizations
      $t().preset(preset).preset(presetExt).use({ useDefaultOptions: true });

      // Apply surface palette if specified
      if (config.surface && surfacePalettes[config.surface as keyof typeof surfacePalettes]) {
        const surfacePalette = surfacePalettes[config.surface as keyof typeof surfacePalettes];
        updateSurfacePalette(surfacePalette);
      }
    }
  }
  // Add this method to your LayoutService class
setLanguage(language: 'en' | 'ar') {
    this.layoutConfig.update((cfg) => ({ ...cfg, language }));
    this.applyLanguage(language);
    this.onConfigUpdate();
}

// Add this private method to apply language changes
private applyLanguage(language: 'en' | 'ar') {
    // Set the language direction based on the language
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    this.setDirection(direction);
    
    // Set the lang attribute on the html element
    document.documentElement.setAttribute('lang', language);
    
    // You might also want to trigger translation loading here
    // this.loadTranslations(language); // Uncomment if you have translation loading logic
}


  // Get preset extension with custom primary and surface configurations
  private getPresetExt() {
    const config = this.layoutConfig();
    const primaryColor = config.primary || 'emerald';
    const isNoir = primaryColor === 'noir';
    
    // Get primary palette
    const primaryPalette = isNoir 
      ? null 
      : primaryPalettes[primaryColor as keyof typeof primaryPalettes] || primaryPalettes.emerald;

    if (isNoir) {
      return {
        semantic: {
          primary: {
            50: '{surface.50}',
            100: '{surface.100}',
            200: '{surface.200}',
            300: '{surface.300}',
            400: '{surface.400}',
            500: '{surface.500}',
            600: '{surface.600}',
            700: '{surface.700}',
            800: '{surface.800}',
            900: '{surface.900}',
            950: '{surface.950}'
          },
          colorScheme: {
            light: {
              primary: {
                color: '{primary.950}',
                contrastColor: '#ffffff',
                hoverColor: '{primary.800}',
                activeColor: '{primary.700}'
              },
              highlight: {
                background: '{primary.950}',
                focusBackground: '{primary.700}',
                color: '#ffffff',
                focusColor: '#ffffff'
              }
            },
            dark: {
              primary: {
                color: '{primary.50}',
                contrastColor: '{primary.950}',
                hoverColor: '{primary.200}',
                activeColor: '{primary.300}'
              },
              highlight: {
                background: '{primary.50}',
                focusBackground: '{primary.300}',
                color: '{primary.950}',
                focusColor: '{primary.950}'
              }
            }
          }
        }
      };
    } else if (config.preset === 'Nora') {
      return {
        semantic: {
          primary: primaryPalette,
          colorScheme: {
            light: {
              primary: {
                color: '{primary.600}',
                contrastColor: '#ffffff',
                hoverColor: '{primary.700}',
                activeColor: '{primary.800}'
              },
              highlight: {
                background: '{primary.600}',
                focusBackground: '{primary.700}',
                color: '#ffffff',
                focusColor: '#ffffff'
              }
            },
            dark: {
              primary: {
                color: '{primary.500}',
                contrastColor: '{surface.900}',
                hoverColor: '{primary.400}',
                activeColor: '{primary.300}'
              },
              highlight: {
                background: '{primary.500}',
                focusBackground: '{primary.400}',
                color: '{surface.900}',
                focusColor: '{surface.900}'
              }
            }
          }
        }
      };
    } else {
      return {
        semantic: {
          primary: primaryPalette,
          colorScheme: {
            light: {
              primary: {
                color: '{primary.500}',
                contrastColor: '#ffffff',
                hoverColor: '{primary.600}',
                activeColor: '{primary.700}'
              },
              highlight: {
                background: '{primary.50}',
                focusBackground: '{primary.100}',
                color: '{primary.700}',
                focusColor: '{primary.800}'
              }
            },
            dark: {
              primary: {
                color: '{primary.400}',
                contrastColor: '{surface.900}',
                hoverColor: '{primary.300}',
                activeColor: '{primary.200}'
              },
              highlight: {
                background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                color: 'rgba(255,255,255,.87)',
                focusColor: 'rgba(255,255,255,.87)'
              }
            }
          }
        }
      };
    }
  }

  applyConfig() {
    const config = this.layoutConfig();

    // Apply each configuration individually
    this.toggleDarkMode(config);
    
    if (config.direction) {
      document.documentElement.setAttribute('dir', config.direction);
    }

    // Apply preset/theme class
    const themeMap: Record<string, string> = {
      Aura: 'theme-aura',
      Lara: 'theme-lara',
      Nora: 'theme-nora'
    };
    
    // Remove old theme classes
    Object.values(themeMap).forEach(cls => {
      if (document.body.classList.contains(cls)) {
        document.body.classList.remove(cls);
      }
    });
    
    // Add current theme class
    const themeClass = themeMap[config.preset || 'Aura'];
    if (themeClass) {
      document.body.classList.add(themeClass);
    }

    // Apply header visibility
    this.applyHeaderVisibility(config.header ?? true);

    // Apply the actual PrimeUI theme preset + overrides
    this.applyThemePreset();

    // Notify listeners
    this.onConfigUpdate();
  }

  applyHeaderVisibility(visible: boolean) {
    const layoutWrapper = document.querySelector('.layout-wrapper') as HTMLElement;
    if (layoutWrapper) {
      if (visible) {
        layoutWrapper.classList.remove('layout-header-hidden');
      } else {
        layoutWrapper.classList.add('layout-header-hidden');
      }
    }

    const topbar = document.querySelector('.layout-topbar') as HTMLElement;
    const topbarComponent = document.querySelector('app-topbar') as HTMLElement;
    
    if (topbar) {
      topbar.style.display = visible ? 'flex' : 'none';
      topbar.style.visibility = visible ? 'visible' : 'hidden';
      topbar.style.opacity = visible ? '1' : '0';
      topbar.style.height = visible ? '70px' : '0';
      topbar.style.overflow = visible ? 'visible' : 'hidden';
    }
    
    if (topbarComponent) {
      topbarComponent.style.display = visible ? 'block' : 'none';
      topbarComponent.style.visibility = visible ? 'visible' : 'hidden';
      topbarComponent.style.opacity = visible ? '1' : '0';
      topbarComponent.style.height = visible ? 'auto' : '0';
      topbarComponent.style.overflow = visible ? 'visible' : 'hidden';
    }
  }
}