// services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { AppConfigService } from '@/pages/service/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // private apiUrl = 'https://localhost:44369/api/';
  private apiUrl = environment.apiUrl;

  // public apiUrl: string;
  constructor(private http: HttpClient, private appConfig: AppConfigService) {
    this.apiUrl = this.appConfig.apiUrl + '/api';
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addProduct(product: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, product);
  }
}