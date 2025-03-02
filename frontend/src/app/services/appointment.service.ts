import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Appointment {
  id: string;
  type: string;
  typeName: string;
  date: string;
  time: string;
  createdAt: Date;
}

interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointments: Appointment[] = [];
  private apiUrl = 'http://localhost:3000/api/appointments';

  constructor(private http: HttpClient) {
    // Load appointments from localStorage if available
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      this.appointments = JSON.parse(savedAppointments);
    }
  }

  getAppointments(): Appointment[] {
    // Sort appointments by date (most recent first)
    return [...this.appointments].sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateA.getTime() - dateB.getTime();
    });
  }

  addAppointment(appointment: Appointment): Observable<any> {
    // Add to local storage
    this.appointments.push(appointment);
    this.saveAppointments();
    
    // Get user info from localStorage (from auth service)
    const userInfoString = localStorage.getItem('user');
    
    if (!userInfoString) {
      console.error('User information not found in localStorage');
      return of({ 
        success: true, 
        message: 'Appointment created but email confirmation could not be sent (user not logged in)' 
      });
    }
    
    try {
      const userInfo: UserInfo = JSON.parse(userInfoString);
      console.log('User info retrieved from localStorage:', {
        id: userInfo.id,
        email: userInfo.email,
        name: `${userInfo.firstName} ${userInfo.lastName}`
      });
      
      // Prepare request payload
      const payload = {
        appointment,
        userId: userInfo.id,
        // Include test user data in case the userId is not a valid MongoDB ObjectId
        testUserEmail: userInfo.email,
        testUserName: `${userInfo.firstName} ${userInfo.lastName}`
      };
      
      console.log('Sending appointment creation request to backend:', payload);
      
      // Send to backend for email confirmation
      return this.http.post(`${this.apiUrl}/create`, payload).pipe(
        tap(response => console.log('Appointment created response:', response)),
        catchError(error => {
          console.error('Error creating appointment:', error);
          // Return a default response so the UI flow isn't interrupted
          return of({ 
            success: true, 
            message: 'Appointment created but email confirmation may not have been sent' 
          });
        })
      );
    } catch (error) {
      console.error('Error parsing user information:', error);
      return of({ 
        success: true, 
        message: 'Appointment created but email confirmation could not be sent (invalid user data)' 
      });
    }
  }

  deleteAppointment(id: string): void {
    this.appointments = this.appointments.filter(app => app.id !== id);
    this.saveAppointments();
  }

  private saveAppointments(): void {
    localStorage.setItem('appointments', JSON.stringify(this.appointments));
  }

  // Generate a unique ID for appointments
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
} 