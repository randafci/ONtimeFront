import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateSection, EditSection, Section } from '@/interfaces/section.interface';
import { ApiResponse } from '@/core/models/api-response.model';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
//   private apiUrl = 'https://localhost:44369/api';
private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllSections(): Observable<ApiResponse<Section[]>> {
    return this.http.get<ApiResponse<Section[]>>(`${this.apiUrl}/Lookup/Section`);
  }

  createSection(data: CreateSection): Observable<ApiResponse<Section>> {
    return this.http.post<ApiResponse<Section>>(`${this.apiUrl}/Lookup/Section`, data);
  }

  getSectionById(id: number): Observable<ApiResponse<Section>> {
    return this.http.get<ApiResponse<Section>>(`${this.apiUrl}/Lookup/Section/${id}`);
  }

  updateSection(data: EditSection): Observable<ApiResponse<Section>> {
    return this.http.put<ApiResponse<Section>>(
      `${this.apiUrl}/Lookup/Section/${data.id}`, 
      { name: data.name, nameSE: data.nameSE }
    );
  }
}
