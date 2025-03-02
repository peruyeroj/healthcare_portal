import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppointmentService } from '../services/appointment.service';

interface CalendarDay {
  date: number;
  fullDate: string;
  otherMonth: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-appointment-scheduling',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './appointment-scheduling.component.html',
  styleUrl: './appointment-scheduling.component.css'
})
export class AppointmentSchedulingComponent implements OnInit {
  // Calendar properties
  currentDate: Date = new Date();
  currentMonth: string = '';
  currentYear: number = 0;
  calendarDays: CalendarDay[] = [];
  selectedDate: CalendarDay | null = null;
  
  // Appointment properties
  appointmentType: string = 'checkup';
  availableTimeSlots: string[] = [];
  selectedTimeSlot: string = '';
  appointmentConfirmed: boolean = false;
  showConfirmationDialog: boolean = false;
  
  // Month names for display
  monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initCalendar();
    
    // Check if there's a user in localStorage for testing
    const userInfo = localStorage.getItem('user');
    if (!userInfo) {
      console.log('No user found in localStorage. Creating a test user for email testing.');
      // Create a test user for email testing
      const testUser = {
        id: '65e2f5c8a7c12345678901234', // Fake MongoDB ID format
        email: 'josephcperuyero@gmail.com', // Use your email for testing
        firstName: 'Joseph',
        lastName: 'Peruyero',
        token: 'fake-jwt-token'
      };
      localStorage.setItem('user', JSON.stringify(testUser));
      console.log('Test user created:', testUser);
    } else {
      console.log('User found in localStorage:', JSON.parse(userInfo));
    }
  }
  
  initCalendar(): void {
    this.currentYear = this.currentDate.getFullYear();
    this.currentMonth = this.monthNames[this.currentDate.getMonth()];
    this.generateCalendarDays();
  }
  
  generateCalendarDays(): void {
    this.calendarDays = [];
    
    // Get the first day of the month
    const firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Add days from previous month to fill the first row
    const prevMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day);
      this.calendarDays.push({
        date: day,
        fullDate: this.formatDate(date),
        otherMonth: true,
        isToday: this.isToday(date)
      });
    }
    
    // Add days for current month
    const today = new Date();
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
      this.calendarDays.push({
        date: day,
        fullDate: this.formatDate(date),
        otherMonth: false,
        isToday: this.isToday(date)
      });
    }
    
    // Add days from next month to complete the grid
    const daysToAdd = 42 - this.calendarDays.length; // 6 rows of 7 days
    for (let day = 1; day <= daysToAdd; day++) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, day);
      this.calendarDays.push({
        date: day,
        fullDate: this.formatDate(date),
        otherMonth: true,
        isToday: this.isToday(date)
      });
    }
  }
  
  formatDate(date: Date): string {
    return `${this.monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
  
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  }
  
  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.currentYear = this.currentDate.getFullYear();
    this.currentMonth = this.monthNames[this.currentDate.getMonth()];
    this.generateCalendarDays();
  }
  
  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.currentYear = this.currentDate.getFullYear();
    this.currentMonth = this.monthNames[this.currentDate.getMonth()];
    this.generateCalendarDays();
  }
  
  selectDate(day: CalendarDay): void {
    // Don't allow selecting days from previous months or past days
    const selectedDate = new Date(day.fullDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today && !day.otherMonth) {
      return; // Don't allow past dates
    }
    
    this.selectedDate = day;
    this.generateTimeSlots();
    this.selectedTimeSlot = '';
  }
  
  generateTimeSlots(): void {
    // In a real app, these would come from an API based on provider availability
    this.availableTimeSlots = [
      '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', 
      '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM',
      '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
      '4:00 PM', '4:30 PM'
    ];
    
    // Randomly remove some slots to simulate unavailability
    const availableCount = Math.floor(Math.random() * 5) + 5; // Between 5 and 10 slots available
    while (this.availableTimeSlots.length > availableCount) {
      const randomIndex = Math.floor(Math.random() * this.availableTimeSlots.length);
      this.availableTimeSlots.splice(randomIndex, 1);
    }
    
    // Sort the time slots
    this.availableTimeSlots.sort();
  }
  
  selectTimeSlot(slot: string): void {
    this.selectedTimeSlot = slot;
  }
  
  getAppointmentTypeName(): string {
    switch(this.appointmentType) {
      case 'checkup': return 'Regular Check-up';
      case 'followup': return 'Follow-up Visit';
      case 'specialist': return 'Specialist Consultation';
      case 'emergency': return 'Urgent Care';
      default: return 'Appointment';
    }
  }
  
  showConfirmation(): void {
    this.showConfirmationDialog = true;
  }
  
  cancelConfirmation(): void {
    this.showConfirmationDialog = false;
  }
  
  scheduleAppointment(): void {
    // Create a new appointment
    const appointment = {
      id: this.appointmentService.generateId(),
      type: this.appointmentType,
      typeName: this.getAppointmentTypeName(),
      date: this.selectedDate?.fullDate || '',
      time: this.selectedTimeSlot,
      createdAt: new Date()
    };
    
    // Save the appointment and send confirmation email
    this.appointmentService.addAppointment(appointment).subscribe({
      next: (response) => {
        console.log('Appointment created response:', response);
        // Show confirmation
        this.showConfirmationDialog = false;
        this.appointmentConfirmed = true;
      },
      error: (error) => {
        console.error('Error creating appointment:', error);
        // Still show confirmation since the appointment was saved locally
        this.showConfirmationDialog = false;
        this.appointmentConfirmed = true;
      }
    });
  }
  
  closeConfirmation(): void {
    this.appointmentConfirmed = false;
    this.selectedDate = null;
    this.selectedTimeSlot = '';
    this.appointmentType = 'checkup';
    
    // Navigate back to home page
    this.router.navigate(['/home']);
  }
}
