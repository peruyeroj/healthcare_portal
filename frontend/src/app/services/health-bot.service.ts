import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class HealthBotService {
  private apiUrl = environment.apiUrl ; // Backend API URL

  constructor(private http: HttpClient) { }

  /**
   * Send a health-related query to the backend
   * @param message The user's health-related question
   * @returns Observable with the AI response
   */
  sendHealthQuery(message: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/health?msg=${encodeURIComponent(message)}`, {
      responseType: 'text'
    });
  }

  /**
   * Send a health-related query with an image to the backend
   * @param message The user's health-related question
   * @param file The image file to upload
   * @returns Observable with the AI response
   */
  sendHealthQueryWithImage(message: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('msg', message);
    formData.append('file', file);
    
    return this.http.post(`${this.apiUrl}/health`, formData, {
      responseType: 'text'
    });
  }

  /**
   * Test connection to the backend
   * @returns Observable with the test response
   */
  testConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test`);
  }
} 