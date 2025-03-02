import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppointmentService, Appointment } from '../services/appointment.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent implements OnInit {
  appointments: Appointment[] = [];
  activeTab: 'current' | 'schedule' = 'current';
  showCancelModal: boolean = false;
  appointmentToCancel: string = '';
  
  constructor(private appointmentService: AppointmentService) {}
  
  ngOnInit(): void {
    this.loadAppointments();
  }
  
  loadAppointments(): void {
    this.appointments = this.appointmentService.getAppointments();
    
    // If there are no appointments, default to the schedule tab
    if (this.appointments.length === 0) {
      this.activeTab = 'schedule';
    }
  }
  
  setActiveTab(tab: 'current' | 'schedule'): void {
    this.activeTab = tab;
  }
  
  showCancellationModal(appointmentId: string): void {
    this.appointmentToCancel = appointmentId;
    this.showCancelModal = true;
  }
  
  closeCancellationModal(): void {
    this.showCancelModal = false;
    this.appointmentToCancel = '';
  }
  
  confirmCancellation(): void {
    if (this.appointmentToCancel) {
      this.appointmentService.deleteAppointment(this.appointmentToCancel);
      this.loadAppointments();
      this.closeCancellationModal();
    }
  }
  
  // Format date for better display
  formatAppointmentDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  }
  
  // Check if appointment is upcoming
  isUpcoming(dateStr: string, timeStr: string): boolean {
    const appointmentDate = new Date(`${dateStr} ${timeStr}`);
    const now = new Date();
    return appointmentDate > now;
  }
}
