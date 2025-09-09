import { TranslationService } from '../../pages/translation-manager/translation-manager/translation.service';
import { Pipe, PipeTransform, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Keep this as false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private translations: any = {};
  private subscription: Subscription;

  constructor(private translationService: TranslationService) {
    // Subscribe to the centralized translations observable
    this.subscription = this.translationService.translations$.subscribe(data => {
      this.translations = data;
    });
  }

  transform(key: string): string {
    if (!this.translations || !key) {
      return key;
    }
    // The lookup logic remains the same
    return key.split('.').reduce((obj, k) => obj && obj[k], this.translations) || key;
  }

  ngOnDestroy(): void {
    // Clean up the subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}