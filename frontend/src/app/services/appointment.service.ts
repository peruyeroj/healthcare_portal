import { Injectable } from '@angular/core';

export interface Appointment {
  id: string;
  type: string;
  typeName: string;
  date: string;
  time: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointments: Appointment[] = [];

  constructor() {
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

  addAppointment(appointment: Appointment): void {
    this.appointments.push(appointment);
    this.saveAppointments();
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