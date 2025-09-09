import { Component, OnInit } from '@angular/core';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { CommonModule } from '@angular/common'; // Often needed for directives

import { finalize } from 'rxjs';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { ActivatedRoute } from '@angular/router';
import { TranslationService } from './translation.service';

@Component({
  selector: 'app-translation-manager',
  standalone: true,
  imports: [
    CommonModule,
    JsonEditorComponent, // <--- IMPORT THE MODULE HERE
    TranslatePipe
  ],
  templateUrl: './translation-manager.component.html',
  styleUrls: ['./translation-manager.component.scss']
})
export class TranslationManagerComponent implements OnInit {

  public editorOptions: JsonEditorOptions;
  public initialData: any = null;
  public visibleData: any = null;

  public lang: string = '';
  public title: string = '';

  public isLoading = true;
  public isSaving = false;
  public updateStatus: 'success' | 'error' | null = null;

  constructor(
    private translationService: TranslationService,
    private route: ActivatedRoute
  ) {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'tree';
    this.editorOptions.modes = ['code', 'form', 'text', 'tree', 'view'];
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const langParam = params.get('lang');
      if (langParam) {
        this.lang = langParam;
        this.isLoading = true;
        this.updateStatus = null;
        this.translationService.loadTranslations(this.lang).subscribe();
        this.setTitle();
      }
    });


    this.translationService.translations$.subscribe(data => {
        this.initialData = data;
        this.visibleData = data;
        this.isLoading = false;
    });
  }

  setTitle(): void {
    if (this.lang === 'ar') {
      this.title = 'Arabic Translations';
    } else if (this.lang === 'en') {
      this.title = 'English Translations';
    } else {
      this.title = 'Translations';
    }
  }


  onDataChange(event: any) {
    this.visibleData = event;
  }

  onSubmit() {
    if (!this.visibleData) return;
    this.isSaving = true;
    this.updateStatus = null;

    this.translationService.updateTranslations(this.lang, this.visibleData)
      .pipe(finalize(() => { this.isSaving = false; }))
      .subscribe({
        next: () => {
          this.updateStatus = 'success';
          this.initialData = this.visibleData;
        },
        error: () => { this.updateStatus = 'error'; }
      });
  }
}