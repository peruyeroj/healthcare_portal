import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgForOf, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [RouterLink, NgForOf, NgIf, FormsModule, DatePipe],
  templateUrl: './medications.component.html',
  styleUrls: ['./medications.component.css']
})
export class MedicationsComponent {
  medications = [
    // Example medication data
    { name: 'Lisinopril', dateStarted: new Date('2023-10-15'), orderedBy: 'Dr. Smith', dose: '10mg', frequency: 'Once daily', route: 'by mouth', selected: false, showMoreInfo: false },
    { name: 'Metformin', dateStarted: new Date('2023-08-22'), orderedBy: 'Dr. Jones', dose: '500mg', frequency: 'Twice daily', route: 'by mouth', selected: false, showMoreInfo: false },
    { name: 'Atorvastatin', dateStarted: new Date('2023-11-05'), orderedBy: 'Dr. Smith', dose: '20mg', frequency: 'Once daily at bedtime', route: 'by mouth', selected: false, showMoreInfo: false },
    { name: 'Levothyroxine', dateStarted: new Date('2023-07-10'), orderedBy: 'Dr. Williams', dose: '75mcg', frequency: 'Once daily', route: 'by mouth', selected: false, showMoreInfo: false }
  ];
  showMoreInfo = false;
  renewalInProgress = false;
  selectedDoctor = '';
  doctors = [
    { name: 'Dr. Smith' },
    { name: 'Dr. Jones' },
    { name: 'Dr. Williams' },
    { name: 'Dr. Johnson' }
  ];

  // Modal properties
  showSuccessModal = false;
  showErrorModal = false;
  successMessage = '';
  errorMessage = '';

  constructor(private router: Router) {}

  toggleMoreInfo(medication: { showMoreInfo: boolean; }) {
    medication.showMoreInfo = !medication.showMoreInfo;
  }

  initiateRenewal() {
    this.renewalInProgress = true;
  }

  sendRenewalRequest() {
    // Logic to send renewal request
    console.log('Sending renewal request for selected medications to', this.selectedDoctor);
    
    // Get selected medications
    const selectedMeds = this.medications.filter(med => med.selected);
    
    if (selectedMeds.length > 0) {
      // Format medication names for display
      const medicationNames = selectedMeds.map(med => med.name).join(', ');
      
      // Set success message
      this.successMessage = `Medication(s): ${medicationNames}\nHealthcare Provider: ${this.selectedDoctor}\nDate Submitted: ${new Date().toLocaleDateString()}`;
      
      // Show success modal
      this.showSuccessModal = true;
      
      // Reset form
      this.renewalInProgress = false;
      this.medications.forEach(med => med.selected = false);
      this.selectedDoctor = '';
    } else {
      // Show error modal
      this.errorMessage = 'Please select at least one medication to renew.';
      this.showErrorModal = true;
    }
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  closeErrorModal() {
    this.showErrorModal = false;
  }

  learnMore(medication: { name: string; }) {
    // Navigate to health_bot component with medication info
    this.router.navigate(['/health-bot'], { 
      queryParams: { 
        medication: medication.name,
        query: `Tell me about ${medication.name}`
      } 
    });
  }
}
