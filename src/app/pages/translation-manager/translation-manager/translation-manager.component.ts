import { Component, OnInit, ViewChild } from '@angular/core';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { CommonModule } from '@angular/common'; 

import { finalize } from 'rxjs';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { ActivatedRoute } from '@angular/router';
import { TranslationService } from './translation.service';

@Component({
  selector: 'app-translation-manager',
  standalone: true,
  imports: [
    CommonModule,
    JsonEditorComponent,
    TranslatePipe
  ],
  templateUrl: './translation-manager.component.html',
  styleUrls: ['./translation-manager.component.scss']
})
export class TranslationManagerComponent implements OnInit {
@ViewChild(JsonEditorComponent, { static: false }) editor!: JsonEditorComponent;
  public editorOptions: JsonEditorOptions;
  public initialData: any = null;
  public visibleData: any = null;

  public lang: string = '';
  public title: string = '';

  public isLoading = true;
  public isSaving = false;
  public updateStatus: 'success' | 'error' | null = null;
  public isJsonInvalid = false;


  constructor(
    private translationService: TranslationService,
    private route: ActivatedRoute
  ) {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'tree';
    this.editorOptions.modes = ['code', 'form', 'text', 'tree', 'view'];

    this.editorOptions.onError = () => { this.isJsonInvalid = true; };
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
    try {     
      this.visibleData = this.editor.get();
      this.isJsonInvalid = false; 
    } catch (e) {
      this.isJsonInvalid = true;
      console.error('Invalid JSON format:', e);
    }
  }

  onSubmit() {
    this.onDataChange(null);
    
    if (!this.visibleData || this.isJsonInvalid) return;

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