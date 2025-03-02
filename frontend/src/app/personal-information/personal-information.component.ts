import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule]
})
export class PersonalInformationComponent implements OnInit {
  personalInfoForm: FormGroup;
  isSubmitting = false;
  isEditing = false;
  submitError = '';
  submitSuccess = false;
  
  // List of US states for dropdown
  states = [
    { name: 'Alabama', code: 'AL' },
    { name: 'Alaska', code: 'AK' },
    { name: 'Arizona', code: 'AZ' },
    { name: 'Arkansas', code: 'AR' },
    { name: 'California', code: 'CA' },
    { name: 'Colorado', code: 'CO' },
    { name: 'Connecticut', code: 'CT' },
    { name: 'Delaware', code: 'DE' },
    { name: 'Florida', code: 'FL' },
    { name: 'Georgia', code: 'GA' },
    { name: 'Hawaii', code: 'HI' },
    { name: 'Idaho', code: 'ID' },
    { name: 'Illinois', code: 'IL' },
    { name: 'Indiana', code: 'IN' },
    { name: 'Iowa', code: 'IA' },
    { name: 'Kansas', code: 'KS' },
    { name: 'Kentucky', code: 'KY' },
    { name: 'Louisiana', code: 'LA' },
    { name: 'Maine', code: 'ME' },
    { name: 'Maryland', code: 'MD' },
    { name: 'Massachusetts', code: 'MA' },
    { name: 'Michigan', code: 'MI' },
    { name: 'Minnesota', code: 'MN' },
    { name: 'Mississippi', code: 'MS' },
    { name: 'Missouri', code: 'MO' },
    { name: 'Montana', code: 'MT' },
    { name: 'Nebraska', code: 'NE' },
    { name: 'Nevada', code: 'NV' },
    { name: 'New Hampshire', code: 'NH' },
    { name: 'New Jersey', code: 'NJ' },
    { name: 'New Mexico', code: 'NM' },
    { name: 'New York', code: 'NY' },
    { name: 'North Carolina', code: 'NC' },
    { name: 'North Dakota', code: 'ND' },
    { name: 'Ohio', code: 'OH' },
    { name: 'Oklahoma', code: 'OK' },
    { name: 'Oregon', code: 'OR' },
    { name: 'Pennsylvania', code: 'PA' },
    { name: 'Rhode Island', code: 'RI' },
    { name: 'South Carolina', code: 'SC' },
    { name: 'South Dakota', code: 'SD' },
    { name: 'Tennessee', code: 'TN' },
    { name: 'Texas', code: 'TX' },
    { name: 'Utah', code: 'UT' },
    { name: 'Vermont', code: 'VT' },
    { name: 'Virginia', code: 'VA' },
    { name: 'Washington', code: 'WA' },
    { name: 'West Virginia', code: 'WV' },
    { name: 'Wisconsin', code: 'WI' },
    { name: 'Wyoming', code: 'WY' }
  ];

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private userService: UserService
  ) {
    this.personalInfoForm = this.fb.group({
      fullName: ['', Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      genderIdentity: [''],
      address: ['', Validators.required],
      town: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      primaryPhone: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      alternatePhone: ['', Validators.pattern(/^\+?\d{10,15}$/)]
    });
  }

  ngOnInit() {
    this.loadPersonalInfo();
  }

  loadPersonalInfo() {
    this.userService.getPersonalInfo().subscribe({
      next: (data) => {
        console.log('Personal info loaded successfully:', data);
        if (data.personalInfoCompleted) {
          this.isEditing = true;
          
          // Parse address into components if it exists
          let address = '';
          let town = '';
          let state = '';
          let zipCode = '';
          
          if (data.address) {
            // Try to parse the address format: "street, town, state zipcode"
            const addressParts = data.address.split(',');
            if (addressParts.length >= 3) {
              address = addressParts[0].trim();
              town = addressParts[1].trim();
              
              // The last part should contain state and zip
              const lastPart = addressParts[addressParts.length - 1].trim();
              const stateZipMatch = lastPart.match(/([A-Z]{2})\s+(\d{5}(-\d{4})?)/);
              
              if (stateZipMatch) {
                state = stateZipMatch[1];
                zipCode = stateZipMatch[2];
              }
            } else {
              // If we can't parse it, just put the whole thing in address
              address = data.address;
            }
          }
          
          this.personalInfoForm.patchValue({
            fullName: data.fullName,
            dob: this.formatDateForInput(data.dob),
            gender: data.gender,
            genderIdentity: data.genderIdentity,
            address: address,
            town: town,
            state: state,
            zipCode: zipCode,
            primaryPhone: data.primaryPhone,
            alternatePhone: data.alternatePhone
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading personal information:', error);
        console.error('Status:', error.status);
        console.error('Status text:', error.statusText);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        
        // If it's an authentication error, redirect to login
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.personalInfoForm.valid) {
      this.isSubmitting = true;
      this.submitError = '';
      
      const formData = {...this.personalInfoForm.value};
      
      // Combine address fields into a single address string
      const address = formData.address || '';
      const town = formData.town || '';
      const state = formData.state || '';
      const zipCode = formData.zipCode || '';
      
      // Format: "street, town, state zipcode"
      formData.address = `${address}, ${town}, ${state} ${zipCode}`;
      
      // Remove the individual address fields before sending to API
      delete formData.town;
      delete formData.state;
      delete formData.zipCode;
      
      console.log('Submitting form data:', formData);
      
      this.userService.updatePersonalInfo(formData).subscribe({
        next: (response) => {
          console.log('Personal info updated successfully:', response);
          this.isSubmitting = false;
          this.submitSuccess = true;
          this.isEditing = true;
          
          // Show success message for 3 seconds then redirect
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 3000);
        },
        error: (error: HttpErrorResponse) => {
          this.isSubmitting = false;
          console.error('Error submitting personal information:', error);
          console.error('Status:', error.status);
          console.error('Status text:', error.statusText);
          console.error('Error message:', error.message);
          console.error('Error details:', error.error);
          
          if (error.status === 401 || error.status === 403) {
            this.submitError = 'Your session has expired. Please log in again.';
            localStorage.removeItem('token');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);
          } else if (error.error && error.error.message) {
            this.submitError = error.error.message;
          } else {
            this.submitError = 'An error occurred while saving your information. Please try again.';
          }
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.personalInfoForm.controls).forEach(key => {
        const control = this.personalInfoForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}