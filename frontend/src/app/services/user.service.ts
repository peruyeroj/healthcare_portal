import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface PersonalInfo {
  fullName: string;
  dob: string;
  gender: string;
  genderIdentity: string;
  address: string;
  primaryPhone: string;
  alternatePhone: string;
  email: string;
  personalInfoCompleted?: boolean;
}

interface InsuranceInfo {
  insuranceCompany: string;
  insuranceId: string;
  groupNumber: string;
  insuranceInfoCompleted?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  // Helper method to get auth headers
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Get user's personal information
   */
  getPersonalInfo(): Observable<PersonalInfo> {
    return this.http.get<PersonalInfo>(
      `${this.apiUrl}/personal-info`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Update user's personal information
   */
  updatePersonalInfo(personalInfo: PersonalInfo): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/personal-info`,
      personalInfo,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Get user's insurance information
   */
  getInsuranceInfo(): Observable<InsuranceInfo> {
    return this.http.get<InsuranceInfo>(
      `${this.apiUrl}/insurance-info`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Update user's insurance information
   */
  updateInsuranceInfo(insuranceInfo: InsuranceInfo): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/insurance-info`,
      insuranceInfo,
      { headers: this.getHeaders() }
    );
  }
}