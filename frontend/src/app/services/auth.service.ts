import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'healthcare_auth_token';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Check if user is already logged in (only in browser)
    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  // Register a new user
  register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }

  // Login user
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }

  // Logout user
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
    }
    this.currentUserSubject.next(null);
  }

  // Get current user profile
  getCurrentUser(): Observable<{ user: User }> {
    if (!this.isAuthenticated()) {
      return of({ user: null as any });
    }
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`).pipe(
      catchError(() => {
        this.logout();
        return of({ user: null as any });
      })
    );
  }

  // Get authentication token
  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Handle authentication response
  private handleAuthentication(response: AuthResponse): void {
    const { token, user } = response;
    
    // Save token to local storage (only in browser)
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, token);
    }
    
    // Update current user
    this.currentUserSubject.next(user);
  }

  // Load user from storage on app initialization
  private loadUserFromStorage(): void {
    const token = this.getToken();
    
    if (token) {
      // If we have a token, get the current user
      this.getCurrentUser().subscribe({
        next: (response) => {
          if (response.user) {
            this.currentUserSubject.next(response.user);
          }
        },
        error: () => {
          // If there's an error (e.g., token expired), log the user out
          this.logout();
        }
      });
    }
  }
} 