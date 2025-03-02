import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './messaging.component.html',
  styleUrl: './messaging.component.css'
})
export class MessagingComponent {
  doctors: Doctor[] = [
    { id: '1', name: 'Dr. Smith', specialty: 'Cardiology' },
    { id: '2', name: 'Dr. Jones', specialty: 'Neurology' },
    { id: '3', name: 'Dr. Williams', specialty: 'Pediatrics' },
    { id: '4', name: 'Dr. Johnson', specialty: 'Family Medicine' },
    { id: '5', name: 'Dr. Brown', specialty: 'Dermatology' }
  ];

  selectedDoctor: Doctor | null = null;
  messageContent: string = '';
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  errorDetails: string = '';

  constructor(private http: HttpClient) {}

  selectDoctor(doctor: Doctor): void {
    this.selectedDoctor = doctor;
  }

  sendMessage(): void {
    if (!this.selectedDoctor || !this.messageContent.trim()) {
      this.showErrorMessage = true;
      this.errorDetails = 'Please select a doctor and enter a message.';
      return;
    }

    // Send the message to the backend
    this.http.post('http://localhost:3000/api/messages/send', {
      doctorId: this.selectedDoctor.id,
      doctorName: this.selectedDoctor.name,
      message: this.messageContent
    }).subscribe({
      next: (response) => {
        console.log('Message sent successfully', response);
        this.showSuccessMessage = true;
        this.messageContent = '';
      },
      error: (error) => {
        console.error('Error sending message', error);
        this.showErrorMessage = true;
        this.errorDetails = 'Failed to send message. Please try again later.';
      }
    });
  }

  closeSuccessMessage(): void {
    this.showSuccessMessage = false;
  }

  closeErrorMessage(): void {
    this.showErrorMessage = false;
  }

  startNewMessage(): void {
    this.selectedDoctor = null;
    this.messageContent = '';
    this.showSuccessMessage = false;
  }
}
