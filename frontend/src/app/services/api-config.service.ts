// src/app/services/api-config.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  getApiUrl(): string {
    return environment.apiUrl;
  }
  
  getAuthUrl(): string {
    return `${environment.apiUrl}/auth`;
  }
  
  // Add other endpoint methods as needed
}