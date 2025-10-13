import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
    EmployeePolicy, 
    CreateEmployeePolicy, 
    EditEmployeePolicy,
    GeneralPolicy
} from '@/interfaces/employee-policy.interface';
import { ApiResponse } from '@/core/models/api-response.model';
import { AppConfigService } from '@/pages/service/app-config.service';
import { AuthService } from '@/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class EmployeePolicyService {
    public apiUrl: string;

    constructor(
        private http: HttpClient, 
        private appConfig: AppConfigService,
        private authService: AuthService
    ) {
        this.apiUrl = this.appConfig.apiUrl + '/api';
    }

    private get headers() {
        return { headers: this.authService.getHeaders() };
    }

    // Employee Policy CRUD Operations
    getAllEmployeePolicies(): Observable<ApiResponse<EmployeePolicy[]>> {
        return this.http.get<ApiResponse<EmployeePolicy[]>>(
            `${this.apiUrl}/EmployeePolicy`, 
            this.headers
        );
    }

    getEmployeePoliciesByEmployeeId(employeeId: number): Observable<ApiResponse<EmployeePolicy[]>> {
        return this.getAllEmployeePolicies().pipe(
            map(response => {
                if (response.succeeded && response.data) {
                    return response;
                }
                return response;
            })
        );
    }

    getEmployeePoliciesByEmploymentId(employmentId: number): Observable<ApiResponse<EmployeePolicy[]>> {
        return this.getAllEmployeePolicies().pipe(
            map(response => {
                if (response.succeeded && response.data) {
                    const filtered = response.data.filter(
                        policy => policy.employeeEmploymentId === employmentId
                    );
                    return { ...response, data: filtered };
                }
                return response;
            })
        );
    }

    getEmployeePolicyById(id: number): Observable<ApiResponse<EmployeePolicy>> {
        return this.http.get<ApiResponse<EmployeePolicy>>(
            `${this.apiUrl}/EmployeePolicy/${id}`, 
            this.headers
        );
    }

    createEmployeePolicy(data: CreateEmployeePolicy): Observable<ApiResponse<EmployeePolicy>> {
        return this.http.post<ApiResponse<EmployeePolicy>>(
            `${this.apiUrl}/EmployeePolicy`, 
            data, 
            this.headers
        );
    }

    updateEmployeePolicy(id: number, data: EditEmployeePolicy): Observable<ApiResponse<EmployeePolicy>> {
        return this.http.put<ApiResponse<EmployeePolicy>>(
            `${this.apiUrl}/EmployeePolicy/${id}`, 
            data, 
            this.headers
        );
    }

    deleteEmployeePolicy(id: number): Observable<ApiResponse<boolean>> {
        return this.http.delete<ApiResponse<boolean>>(
            `${this.apiUrl}/EmployeePolicy/${id}`, 
            this.headers
        );
    }

    // General Policies (for dropdown)
    getAllGeneralPolicies(): Observable<ApiResponse<GeneralPolicy[]>> {
        return this.http.get<ApiResponse<GeneralPolicy[]>>(
            `${this.apiUrl}/GeneralPolicy`, 
            this.headers
        );
    }

    getActiveGeneralPolicies(): Observable<ApiResponse<GeneralPolicy[]>> {
        return this.getAllGeneralPolicies().pipe(
            map(response => {
                if (response.succeeded && response.data) {
                    const filtered = response.data.filter(
                        policy => policy.isActive === true
                    );
                    return { ...response, data: filtered };
                }
                return response;
            })
        );
    }
}

