import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../service/layout.service';
import { AppSettingsPanel } from "../../main/settings-panel.component";

@Component({
    selector: 'app-floating-settings',
    standalone: true,
    imports: [CommonModule, StyleClassModule, AppSettingsPanel],
    template: `
        <div [ngClass]="gearPosition()" [class.hidden]="!isHeaderHidden()">
            <button
                class="floating-settings-trigger"
                pStyleClass="@next"
                enterFromClass="hidden"
                enterActiveClass="animate-scalein"
                leaveToClass="hidden"
                leaveActiveClass="animate-fadeout"
                [hideOnOutsideClick]="true"
            >
                <i class="pi pi-cog"></i>
            </button>
            <app-settings-panel/>
        </div>
    `,
    styles: [`
        .floating-settings-button {
            position: fixed;
            top: 20px;
            z-index: 1000;
        }

        .floating-settings-button.ltr {
            right: 20px;
        }

        .floating-settings-button.rtl {
            left: 20px;
        }

        .floating-settings-trigger {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
        }

        .floating-settings-trigger:hover {
            background: var(--primary-color-text);
            transform: scale(1.1);
        }

        .floating-settings-trigger i {
            font-size: 1.2rem;
        }

        .floating-settings-button.hidden {
            display: none;
        }
    `]
})
export class AppFloatingSettings {
    private layoutService = inject(LayoutService);
    
    isHeaderHidden = computed(() => !this.layoutService.isHeaderVisible());
    
    gearPosition = computed(() => {
        const direction = this.layoutService.layoutConfig().direction;
        const baseClass = 'floating-settings-button';
        return direction === 'rtl' ? `${baseClass} rtl` : `${baseClass} ltr`;
    });
}
