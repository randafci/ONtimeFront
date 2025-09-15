import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map, switchMap, tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../../service/app-config.service';
import { ApiResponse } from '../../../core/models/api-response.model';

export interface TranslationDto {
  id: number;
  languageCode: string;
  data: any; 
}
@Injectable({
  providedIn: 'root'
})
export class TranslationService {
public apiUrl : string;

constructor(private http: HttpClient, private appConfig: AppConfigService) {
  this.apiUrl = this.appConfig.apiUrl+'/api';
 }

 loadTranslations(languageCode: string): Observable<any> {
    if (!languageCode) {
      return of({});
    }

    return this.http.get<ApiResponse<TranslationDto>>(`${this.apiUrl}/Translation/${languageCode}`).pipe(
      map(response => {
        if (response && response.succeeded && typeof response.data.data === 'string') {
          try {
            return JSON.parse(response.data.data);
          } catch (e) {
            console.error('Failed to parse translation JSON string:', e);
            return {};
          }
        }
        return {};
      }),
      tap(parsedData => {
        if (Object.keys(parsedData).length > 0) {
          this.translationsSubject.next(parsedData);
          this.currentLangSubject.next(languageCode);
        }
      }),
      catchError(error => {
        console.warn(`Translation data not found for language '${languageCode}'. Using empty translations.`);
        this.translationsSubject.next({});
        this.currentLangSubject.next(languageCode);
        return of({});
      })
    );
  }

  updateTranslations(languageCode: string, updatedTranslations: any): Observable<any> {
    return this.http.get<ApiResponse<TranslationDto>>(`${this.apiUrl}/Translation/${languageCode}`).pipe(
      switchMap(response => {
        const translationId = response.data.id;
        const updateRequest = {
          id: translationId,
          data: JSON.stringify(updatedTranslations)
        };
        return this.http.put(`${this.apiUrl}/Translation/${translationId}`, updateRequest);
      })
    );
  }

  saveTranslations(languageCode: string, newTranslations: any): Observable<TranslationDto> {
    const saveRequest = {
      languageCode: languageCode,
      data: newTranslations
    };
    return this.http.post<TranslationDto>(this.apiUrl, saveRequest);
  }

  private translationsSubject = new BehaviorSubject<any>({});

  public translations$ = this.translationsSubject.asObservable();

  private currentLangSubject = new BehaviorSubject<string>('en');
  public currentLang$ = this.currentLangSubject.asObservable();

  toggleLanguage(): void {
    const currentLang = this.currentLangSubject.getValue();
    const newLang = currentLang === 'ar' ? 'en' : 'ar';

    this.loadTranslations(newLang).subscribe({
      next: () => {
        localStorage.setItem('user-lang', newLang);
      },
      error: (err) => console.error('Failed to switch language', err)
    });
  }

 }