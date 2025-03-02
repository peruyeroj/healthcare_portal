import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-insurance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './insurance.component.html',
  styleUrls: ['./insurance.component.css']
})
export class InsuranceComponent {
  insuranceForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.insuranceForm = this.fb.group({
      insuranceCompany: ['', Validators.required],
      insuranceId: ['', Validators.required],
      groupNumber: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.insuranceForm.valid) {
      console.log('Insurance Data:', this.insuranceForm.value);
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
} 