import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { API_CONFIG } from '../../core/config/api.config';
import { ApiResponse, LoginRequest, LoginResponse, AuthState, User } from '../../core/models/api-response.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null
  });
  authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if token exists in localStorage on service initializationnpm install @angular/common
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const user = this.decodeToken(token);
        this.authStateSubject.next({
          isAuthenticated: true,
          token,
          user
        });
      } catch (error) {
        // If token is invalid, clear it
        localStorage.removeItem('token');
      }
    }
  }

  private decodeToken(token: string): User {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.nameid,
      email: decoded.email,
      name: decoded.name || decoded.email,
      bio: decoded.bio
    };
  }

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`, credentials)
      .pipe(
        tap(response => {
          console.log('Login response:', response );
          if (response.statusCode === 200 ) {

            const token = response.data?.token??"";
            const user = this.decodeToken(token??"");
            
            localStorage.setItem('token', token??"");
            this.authStateSubject.next({
              isAuthenticated: true,
              token,
              user
            });
          } else {
            throw new Error(response.message || 'Login failed');
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.authStateSubject.next({
      isAuthenticated: false,
      token: null,
      user: null
    });
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.authStateSubject.value.token;
  }

  isLoggedIn(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  getAuthState(): Observable<AuthState> {
    return this.authStateSubject.asObservable();
  }
} 