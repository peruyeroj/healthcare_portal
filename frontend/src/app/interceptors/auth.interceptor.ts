import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment.prod';

// Class-based interceptor (for backward compatibility)
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip token handling on server-side
    if (!isPlatformBrowser(this.platformId)) {
      return next.handle(request);
    }
    
    // Get the auth token
    const token = this.authService.getToken();

    // If the token exists and the request is going to our API
    if (token && request.url.includes(environment.apiUrl )) {
      // Clone the request and add the authorization header
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Pass the cloned request with the token to the next handler
      return next.handle(authRequest);
    }
    
    // If no token or not our API, pass the original request
    return next.handle(request);
  }
}

// Function-based interceptor (for Angular's new HTTP interceptor system)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);
  
  // Skip token handling on server-side
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }
  
  const token = authService.getToken();

  // If the token exists and the request is going to our API
  if (token && req.url.includes(environment.apiUrl)) {
    // Clone the request and add the authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Pass the cloned request with the token to the next handler
    return next(authReq);
  }
  
  // If no token or not our API, pass the original request
  return next(req);
}; 