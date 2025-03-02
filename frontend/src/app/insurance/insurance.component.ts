import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-insurance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './insurance.component.html',
  styleUrls: ['./insurance.component.css']
})
export class InsuranceComponent implements OnInit {
  insuranceForm: FormGroup;
  isSubmitting = false;
  isEditing = false;
  submitError = '';
  submitSuccess = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private userService: UserService
  ) {
    this.insuranceForm = this.fb.group({
      insuranceCompany: ['', Validators.required],
      insuranceId: ['', Validators.required],
      groupNumber: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadInsuranceInfo();
  }

  loadInsuranceInfo() {
    this.userService.getInsuranceInfo().subscribe({
      next: (data) => {
        if (data.insuranceInfoCompleted) {
          this.isEditing = true;
          this.insuranceForm.patchValue({
            insuranceCompany: data.insuranceCompany,
            insuranceId: data.insuranceId,
            groupNumber: data.groupNumber
          });
        }
      },
      error: (error) => {
        console.error('Error loading insurance information:', error);
      }
    });
  }

  onSubmit() {
    if (this.insuranceForm.valid) {
      this.isSubmitting = true;
      this.submitError = '';
      
      this.userService.updateInsuranceInfo(this.insuranceForm.value).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.submitSuccess = true;
          this.isEditing = true;
          
          // Show success message for 3 seconds then redirect
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 3000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.submitError = error.message || 'An error occurred while saving your information. Please try again.';
          console.error('Error submitting insurance information:', error);
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.insuranceForm.controls).forEach(key => {
        const control = this.insuranceForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
} 