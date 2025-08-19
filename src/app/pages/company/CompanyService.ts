import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCompany, EditCompany, Company } from '@/interfaces/company.interface';
import { ApiResponse } from '@/interfaces/apiResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = 'https://localhost:7148/api';

  constructor(private http: HttpClient) { }

  getAllCompanies(): Observable<ApiResponse<Company[]>> {
    return this.http.get<ApiResponse<Company[]>>(`${this.apiUrl}/Lookup/Company`);
  }

  createCompany(data: CreateCompany): Observable<ApiResponse<Company>> {
    return this.http.post<ApiResponse<Company>>(`${this.apiUrl}/Lookup/Company`, data);
  }

  getCompanyById(id: number): Observable<ApiResponse<Company>> {
    return this.http.get<ApiResponse<Company>>(`${this.apiUrl}/Lookup/Company/${id}`);
  }

  updateCompany(data: EditCompany): Observable<ApiResponse<Company>> {
    return this.http.put<ApiResponse<Company>>(
      `${this.apiUrl}/Lookup/Company/${data.id}`, 
      { name: data.name, nameSE: data.nameSE }
    );
  }
}
