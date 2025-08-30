import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCompany, EditCompany, Company } from '@/interfaces/company.interface';
import { AuthService } from '@/auth/auth.service';
import { ApiResponse } from '@/core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = 'https://localhost:7148/api';

  constructor(private http: HttpClient ,
    private authService :AuthService
  ) { }

  getAllCompanies(): Observable<ApiResponse<Company[]>> {
      const headers = this.authService.getHeaders();

    return this.http.get<ApiResponse<Company[]>>(`${this.apiUrl}/Lookup/Company` , { headers });
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
