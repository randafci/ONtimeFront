import { LayoutService } from '@/layout/service/layout.service';
import { Component, computed, inject, input } from '@angular/core';

import { ButtonModule, Button } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import {CommonModule} from "@angular/common";
import { Configurator } from "../configurator/configurator";
@Component({
  selector: 'app-floating-configurator',
    imports: [CommonModule, ButtonModule, StyleClassModule, Configurator],
  templateUrl: './floating-configurator.html',
  styleUrl: './floating-configurator.scss'
})
export class FloatingConfigurator {
LayoutService = inject(LayoutService);

    float = input<boolean>(true);

    isDarkTheme = computed(() => this.LayoutService.layoutConfig().darkTheme);

    toggleDarkMode() {
        this.LayoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
