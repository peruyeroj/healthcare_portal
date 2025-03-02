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
  userEmail: string = ''; // Store the user's email for display only

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
          this.userEmail = data.email; // Store email for display only
          this.personalInfoForm.patchValue({
            fullName: data.fullName,
            dob: this.formatDateForInput(data.dob),
            gender: data.gender,
            genderIdentity: data.genderIdentity,
            address: data.address,
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